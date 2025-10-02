import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ImageBackground,
    ActivityIndicator,
    ScrollView,
    Linking,
    Platform,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios'; // Using axios directly as in your original code

// --- Theme (Consistent with other screens) ---
const theme = {
    primary: '#3A86FF',
    background: '#F0F4F8',
    surface: '#FFFFFF',
    text: '#1C2A3A',
    textSecondary: '#6E7D8C',
    danger: '#D32F2F',
    success: '#388E3C',
};

// --- Reusable Component for Image Selection ---
const ImagePickerCard = ({ imageUri, onSelectImage, onClearImage }) => (
    <View style={styles.card}>
        {imageUri ? (
            <ImageBackground source={{ uri: imageUri }} style={styles.imagePreview} imageStyle={{ borderRadius: 12 }}>
                <View style={styles.imageOverlay}>
                    <TouchableOpacity style={styles.clearButton} onPress={onClearImage}>
                        <Icon name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        ) : (
            <TouchableOpacity style={styles.placeholderContainer} onPress={onSelectImage}>
                <Icon name="image-plus" size={50} color={theme.primary} />
                <Text style={styles.placeholderText}>Tap to Select X-Ray</Text>
                <Text style={styles.placeholderSubText}>from camera or gallery</Text>
            </TouchableOpacity>
        )}
    </View>
);

// --- Reusable Component for Displaying Prediction Result ---
const PredictionResultCard = ({ prediction }) => {
    if (!prediction) return null;
    const isPneumonia = prediction.prediction?.toLowerCase() === 'pneumonia';
    const resultColor = isPneumonia ? theme.danger : theme.success;
    const confidence = parseFloat(prediction.confidence || 0) * 100;

    return (
        <View style={[styles.card, styles.resultCard, { borderColor: resultColor }]}>
            <Text style={styles.resultTitle}>Analysis Complete</Text>
            <Text style={[styles.resultText, { color: resultColor }]}>{prediction.prediction}</Text>
            <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <Text style={[styles.confidenceValue, { color: resultColor }]}>{confidence.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${confidence}%`, backgroundColor: resultColor }]} />
            </View>
        </View>
    );
};


// --- Main Screen Component ---
export default function PneumoniaPredictScreen() {
    const [hasPermission, setHasPermission] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);

    const requestPermissions = useCallback(async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
            setHasPermission(false);
        } else {
            setHasPermission(true);
        }
    }, []);

    useEffect(() => {
        requestPermissions();
    }, [requestPermissions]);
    
    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setPrediction(null);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setPrediction(null);
        }
    };
    
    const handleImageSelect = () => {
        Alert.alert(
            "Select Image Source",
            "Choose where to get the X-ray image from.",
            [
                { text: "Camera", onPress: takePhoto },
                { text: "Gallery", onPress: pickImage },
                { text: "Cancel", style: "cancel" },
            ]
        );
    };

    const handlePredict = async () => {
        if (!imageUri) return;
        setIsLoading(true);
        setPrediction(null);

        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          type: "image/jpeg",
          name: "xray.jpg",
        });

        try {
            const response = await axios.post("http://127.0.0.1:5000/pneumonia_predict", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            setPrediction(response.data);
        } catch (error) {
            console.error("Prediction Error:", error.response || error);
            Alert.alert("Analysis Failed", "Failed to get prediction from server. Please check your network and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (hasPermission === null) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={theme.primary} /><Text style={{marginTop: 10, color: theme.textSecondary}}>Requesting permissions...</Text></View>;
    }
    if (hasPermission === false) {
        return (
            <View style={styles.centered}>
                <Icon name="camera-off-outline" size={60} color={theme.textSecondary} />
                <Text style={styles.permissionText}>Permissions Required</Text>
                <Text style={styles.permissionSubText}>Vitalis AI needs access to your camera and gallery to analyze X-ray images.</Text>
                <TouchableOpacity style={styles.button} onPress={() => Linking.openSettings()}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.header}>Pneumonia Analysis</Text>
                <Text style={styles.subtitle}>Upload a chest X-ray image to get an AI-powered analysis.</Text>

                <ImagePickerCard
                    imageUri={imageUri}
                    onSelectImage={handleImageSelect}
                    onClearImage={() => {
                        setImageUri(null);
                        setPrediction(null);
                    }}
                />

                {imageUri && !isLoading && (
                    <TouchableOpacity style={styles.button} onPress={handlePredict}>
                        <Icon name="magnify-scan" size={22} color="white" style={{marginRight: 10}}/>
                        <Text style={styles.buttonText}>Analyze X-Ray</Text>
                    </TouchableOpacity>
                )}

                {isLoading && <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 20 }} />}
                
                {prediction && <PredictionResultCard prediction={prediction} />}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContainer: { padding: 20, flexGrow: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: theme.background },
    header: { fontSize: 28, fontWeight: 'bold', color: theme.text, textAlign: 'center' },
    subtitle: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 24 },
    card: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        marginBottom: 20,
    },
    placeholderContainer: {
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E7F1',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 16,
    },
    placeholderText: { fontSize: 18, fontWeight: '600', color: theme.primary, marginTop: 12 },
    placeholderSubText: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
    imagePreview: {
        height: 350,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        borderRadius: 12,
        overflow: 'hidden'
    },
    imageOverlay: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        flex: 1,
        width: '100%',
        alignItems: 'flex-end',
    },
    clearButton: {
        margin: 12,
        padding: 6,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
    },
    button: {
        backgroundColor: theme.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        elevation: 3,
        shadowColor: theme.primary,
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
    },
    buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
    resultCard: { borderLeftWidth: 5, padding: 16 },
    resultTitle: { fontSize: 18, fontWeight: '600', color: theme.text, textAlign: 'center' },
    resultText: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 8, textTransform: 'capitalize' },
    confidenceContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' },
    confidenceLabel: { fontSize: 16, color: theme.textSecondary },
    confidenceValue: { fontSize: 16, fontWeight: 'bold' },
    progressBar: { height: 10, backgroundColor: '#E0E7F1', borderRadius: 5, marginTop: 8, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 5 },
    permissionText: { fontSize: 22, fontWeight: 'bold', color: theme.text, textAlign: 'center', marginTop: 16 },
    permissionSubText: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginTop: 12, marginBottom: 24 },
});