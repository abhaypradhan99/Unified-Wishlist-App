import { View } from 'react-native';

export default function SkeletonLoader({ count = 3 }: { count?: number }) {
  return (
    <View>
      {[...Array(count)].map((_, i) => (
        <View key={i} style={{ flexDirection: 'row', marginVertical: 10 }}>
          <View style={{ width: 50, height: 50, backgroundColor: '#ddd', marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <View style={{ height: 20, backgroundColor: '#ddd', marginBottom: 5 }} />
            <View style={{ height: 20, backgroundColor: '#ddd', width: '50%' }} />
          </View>
        </View>
      ))}
    </View>
  );
}