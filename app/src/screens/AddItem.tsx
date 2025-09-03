import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import axios from "axios";
import { normalizeUrl } from "../utils/normalizeUrl";
import { addItem } from "../utils/db";

export default function AddItem({ route, navigation }: any) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const deepUrl = route.params?.url;
    if (deepUrl) {
      setUrl(deepUrl);
      fetchPreview(deepUrl);
    }
  }, [route.params]);

  const fetchPreview = async (fetchUrl: string = url) => {
    if (!fetchUrl) return;
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      const res = await axios.post(
        "http://192.168.1.11:3000/preview",
        { url: fetchUrl },
        { timeout: 10000 }
      );
      setPreview(res.data);
    } catch (e) {
      setError("⚠️ Error loading preview. Try again?");
    }
    setLoading(false);
  };

  const handleAdd = () => {
    if (!preview) return;
    const normalized = normalizeUrl(url);
    const domain =
      url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\?#]+)/i)?.[1] || "unknown";

    addItem(
      {
        ...preview,
        price: preview.price || "N/A",
        domain,
        createdAt: new Date().toISOString(),
        normalizedUrl: normalized,
      },
      (success) => {
        if (success) navigation.goBack();
        else setError("⚠️ Item already exists");
      }
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#d9fcd9", padding: 20 }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View
        style={{
          alignSelf: "center",
          backgroundColor: "black",
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 5,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
          ADD ITEM
        </Text>
      </View>

      {/* Input Box */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 15,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 5,
          marginBottom: 15,
        }}
      >
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Paste or Enter URL
        </Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com/product"
          accessibilityLabel="Enter URL to add item"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 10,
            backgroundColor: "#f9f9f9",
          }}
        />
        <TouchableOpacity
          onPress={() => fetchPreview()}
          style={{
            backgroundColor: "black",
            padding: 12,
            borderRadius: 12,
            marginTop: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            🔍 Get Preview
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loader */}
      {loading && (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <ActivityIndicator size="large" color="black" />
          <Text style={{ marginTop: 10 }}>Fetching preview...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View
          style={{
            backgroundColor: "#ffe6e6",
            borderRadius: 10,
            padding: 12,
            marginBottom: 15,
          }}
        >
          <Text style={{ color: "red", marginBottom: 8 }}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchPreview()}
            style={{
              backgroundColor: "red",
              padding: 10,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Preview Card */}
      {preview && (
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 15,
            padding: 15,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            marginBottom: 20,
          }}
        >
          {preview.image && (
            <Image
              source={{ uri: preview.image }}
              style={{
                width: "100%",
                height: 150,
                borderRadius: 10,
                marginBottom: 10,
              }}
              resizeMode="cover"
            />
          )}
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 5 }}>
            {preview.title}
          </Text>
          <Text style={{ fontSize: 14, color: "gray" }}>
            From: {preview.siteName}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginVertical: 8,
              color: "#2E7D32",
            }}
          >
            Price: {preview.price || "N/A"}
          </Text>
          <TouchableOpacity
            onPress={handleAdd}
            style={{
              backgroundColor: "black",
              padding: 12,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>
              ➕ Add to Wishlist
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
