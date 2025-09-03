import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Share, Image } from "react-native";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import * as Progress from "react-native-progress";
import WishlistItem from "../components/WishlistItem";
import SkeletonLoader from "../components/SkeletonLoader";
import { getItems, deleteItem } from "../utils/db";

export default function Dashboard({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const goal = 499.99;
  const dailySavings = 2;

  // Calculate saved from sum of item prices
  const saved = items.reduce((total, item) => {
    const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
    return total + price;
  }, 0);

  const daysToGoal = Math.max(0, Math.ceil((goal - saved) / dailySavings));

  useFocusEffect(() => {
    getItems((data) => {
      setItems(data);
      setLoading(false);
    });
  });

  const handleDelete = (id: number) => {
    deleteItem(id, () => getItems(setItems));
  };

  const handleShare = async (normalizedUrl: string) => {
    await Share.share({ url: `centscape://add?url=${normalizedUrl}` });
  };

  const renderRightActions = (id: number) => (
    <View style={{ flexDirection: 'row', height: '100%' }}>
      <TouchableOpacity
        onPress={() => handleShare(items.find(item => item.id === id)?.normalizedUrl || '')}
        style={{ backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', width: 60 }}
      >
        <Image source={require('../assets/share.png')} style={{ width: 24, height: 24, tintColor: 'white' }} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDelete(id)}
        style={{ backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', width: 60 }}
      >
        <Image source={require('../assets/share.png')} style={{ width: 24, height: 24, tintColor: 'white' }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#d9fcd9", padding: 20 }}>
        {/* Header */}
        <View style={{ alignSelf: "center", backgroundColor: "black", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 5, marginBottom: 15, }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}> MY DASHBOARD </Text>
        </View>
        {/* Progress Card */}
        <View style={{ backgroundColor: "white", borderRadius: 12, padding: 15, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, }}>
          <Text style={{ marginBottom: 5, color: "gray" }}>Your progress</Text>
          <Text style={{ color: "green", fontWeight: "600", fontSize: 16 }}> You have saved ${saved} </Text>
          <Progress.Bar progress={Math.min(saved / goal, 1)} width={null} color="#4CAF50" borderRadius={10} style={{ marginVertical: 10 }} />
          <Text style={{ alignSelf: "flex-end", backgroundColor: "black", color: "white", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, fontSize: 12, }}>
            {saved >= goal ? "Goal reached!" : `$${goal - saved} to go`}
          </Text>
        </View>
        {/* Wishlist Section */}
        <View style={{ alignSelf: "flex-start", backgroundColor: "black", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5, marginBottom: 15, }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "white" }}> MY WISHLIST </Text>
        </View>
        {loading ? (
          <SkeletonLoader count={2} />
        ) : (
        <FlatList
  data={items}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <WishlistItem
      item={item}
      onShare={() => handleShare(item.normalizedUrl)}
      onDelete={() => handleDelete(item.id)}
    />
  )}
  ListEmptyComponent={<Text>No items yet</Text>}
/>

        )}
        {/* Add Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("AddItem")}
          accessibilityLabel="Add items to your Centscape Wishlist"
          style={{ flexDirection: "row", alignItems: "center", marginVertical: 15, }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "black", justifyContent: "center", alignItems: "center", marginRight: 10, }}>
            <Text style={{ fontSize: 24, color: "white" }}>+</Text>
          </View>
          <Text style={{ fontSize: 16 }}> Add items to your Centscape Wishlist </Text>
        </TouchableOpacity>
        {/* Footer */}
        <Text style={{ textAlign: "center", marginTop: 10 }}> Keep going ! According to your spending habits you will reach your goal of ${goal} in{" "}
          <Text style={{ fontWeight: "bold" }}>{daysToGoal} DAYS !</Text>
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}