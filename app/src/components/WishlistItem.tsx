import { View, Text, Image, TouchableOpacity } from 'react-native';

export default function WishlistItem({ item, onShare }: { item: any; onShare: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/50' }} 
        style={{ width: 50, height: 50, marginRight: 10 }} 
        accessibilityLabel={`Image for ${item.title}`}
      />
      <View style={{ flex: 1 }}>
        <Text>{item.title}</Text>
        <Text>{item.price}</Text>
        <Text>From: {item.domain}</Text>
        <Text>Added: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity onPress={onShare} accessibilityLabel="Share this wishlist item">
        <Text>Share</Text>
      </TouchableOpacity>
    </View>
  );
}