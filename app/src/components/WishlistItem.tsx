import { View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function WishlistItem({
  item,
  onShare,
  onDelete,
}: {
  item: any;
  onShare: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        padding: 12,
        backgroundColor: "white",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Item Image */}
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/50" }}
        style={{ width: 55, height: 55, marginRight: 12, borderRadius: 8 }}
        accessibilityLabel={`Image for ${item.title}`}
      />

      {/* Item Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: "600", fontSize: 16 }} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={{ color: "green", marginVertical: 2 }}>{item.price}</Text>
        <Text style={{ fontSize: 12, color: "gray" }}>From: {item.domain}</Text>
        <Text style={{ fontSize: 12, color: "gray" }}>
          Added: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={onShare}
          accessibilityLabel="Share this wishlist item"
          style={{
            marginLeft: 8,
            padding: 8,
            borderRadius: 20,
            backgroundColor: "#2196F3",
          }}
        >
          <Icon name="share" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          accessibilityLabel="Delete this wishlist item"
          style={{
            marginLeft: 8,
            padding: 8,
            borderRadius: 20,
            backgroundColor: "#E53935",
          }}
        >
          <Icon name="delete" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
