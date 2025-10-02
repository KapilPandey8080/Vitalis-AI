import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    ScrollView, 
    TouchableOpacity, 
    StyleSheet, 
    SafeAreaView,
    Animated,
    ActivityIndicator,
    Modal
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Theme Colors (Consistent with other screens) ---
const theme = {
    primary: '#3A86FF',
    secondary: '#50E3C2',
    background: '#F0F4F8',
    surface: '#FFFFFF',
    text: '#1C2A3A',
    textSecondary: '#6E7D8C',
    shadow: 'rgba(58, 134, 255, 0.2)',
    danger: '#FF6B6B', // Malignant
    success: '#4CAF50', // Benign
    warning: '#FF9F43',
};

// --- Reusable Animated Input Component ---
const AnimatedTextInput = ({ label, value, onChangeText, index, ...props }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            delay: index * 50, // Faster delay for more fields
            useNativeDriver: true,
        }).start();
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            delay: index * 50,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, slideAnim, index]);

    return (
        <Animated.View style={[styles.inputContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor={theme.textSecondary}
                {...props}
            />
        </Animated.View>
    );
};

// --- Custom Modal for Alerts ---
const CustomAlertModal = ({ visible, title, message, onDismiss, type }) => {
    const modalIcon = { error: 'alert-circle-outline', success: 'check-circle-outline' };
    const modalColor = { error: theme.danger, success: theme.success };

    return (
        <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onDismiss}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Icon name={modalIcon[type] || 'information-outline'} size={40} color={modalColor[type] || theme.primary} />
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalMessage}>{message}</Text>
                    <TouchableOpacity style={styles.modalButton} onPress={onDismiss}>
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// --- Main BCancerPredict Component ---
const BCancerPredict = () => {
    const [features, setFeatures] = useState(Array(10).fill(""));
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'error' });

    const featureLabels = [
        'Mean Radius', 'Mean Perimeter', 'Mean Area', 'Mean Concavity', 'Concave Points Mean',
        'Mean Compactness', 'Mean Texture', 'Mean Smoothness', 'Mean Symmetry', 'Mean Fractal Dimension'
    ];

    const handleSubmit = async () => {
        if (features.some(f => f === '')) {
            setAlert({ visible: true, title: 'Incomplete Form', message: 'Please fill out all 10 fields.', type: 'error' });
            return;
        }
        
        setIsLoading(true);
        setResult(null);
        try {
            const input_data = features.map(Number);
            const response = await axios.post("http://127.0.0.1:5000/breast_cancer_predict", { input_data });

            setResult({
                message: response.data.message,
                malignant: response.data.probability_malignant,
                benign: response.data.probability_benign
            });
        } catch (error) {
            const errorMessage = error?.response?.data?.error || "An unexpected error occurred. Please try again.";
            setAlert({ visible: true, title: 'Prediction Failed', message: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CustomAlertModal 
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onDismiss={() => setAlert({ ...alert, visible: false })}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>Enter the tumor characteristics below.</Text>

                {featureLabels.map((label, index) => (
                    <AnimatedTextInput
                        key={index}
                        index={index}
                        label={label}
                        keyboardType="numeric"
                        placeholder="Enter value..."
                        value={features[index]}
                        onChangeText={(text) => {
                            const newFeatures = [...features];
                            newFeatures[index] = text.replace(/[^0-9.]/g, '');
                            setFeatures(newFeatures);
                        }}
                    />
                ))}

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.buttonText}>Analyze Tumor</Text>}
                </TouchableOpacity>

                {result && (
                    <Animated.View style={[styles.resultCard, {
                        borderColor: result.message.includes('Malignant') ? theme.danger : theme.success,
                        backgroundColor: result.message.includes('Malignant') ? '#FFF1F1' : '#F0FFF0'
                    }]}>
                        <Text style={styles.resultTitle}>Analysis Result</Text>
                        <Text style={[styles.resultText, { color: result.message.includes('Malignant') ? theme.danger : theme.success }]}>
                            {result.message}
                        </Text>
                        
                        <View style={styles.probabilityContainer}>
                            <View style={styles.probRow}>
                                <Text style={styles.probLabel}>Confidence (Malignant)</Text>
                                <Text style={[styles.probValue, {color: theme.danger}]}>{(result.malignant * 100).toFixed(1)}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${result.malignant * 100}%`, backgroundColor: theme.danger }]} />
                            </View>
                        </View>
                        
                        <View style={styles.probabilityContainer}>
                           <View style={styles.probRow}>
                                <Text style={styles.probLabel}>Confidence (Benign)</Text>
                                <Text style={[styles.probValue, {color: theme.success}]}>{(result.benign * 100).toFixed(1)}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${result.benign * 100}%`, backgroundColor: theme.success }]} />
                            </View>
                        </View>

                        <View style={styles.noteContainer}>
                            <Icon name="information" size={20} color={theme.primary} />
                            <Text style={styles.noteText}>This is an AI-generated analysis and not a medical diagnosis. Always consult a healthcare professional.</Text>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
    subtitle: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginBottom: 24 },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 14, color: theme.textSecondary, marginBottom: 8, fontWeight: '500' },
    input: {
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: '#E0E7F1',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.text,
    },
    button: {
        backgroundColor: theme.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    buttonDisabled: { backgroundColor: '#A9C5E8' },
    buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
    resultCard: {
        marginTop: 30,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    resultTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 8, textAlign: 'center' },
    resultText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    probabilityContainer: { marginBottom: 15 },
    probRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    probLabel: { fontSize: 14, color: theme.textSecondary },
    probValue: { fontSize: 14, fontWeight: 'bold' },
    progressBar: { height: 8, backgroundColor: '#E0E7F1', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    noteContainer: {
        marginTop: 20,
        padding: 12,
        backgroundColor: 'rgba(58, 134, 255, 0.08)',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteText: { fontSize: 13, color: theme.textSecondary, lineHeight: 18, flex: 1, marginLeft: 10 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContainer: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, marginTop: 16, marginBottom: 8 },
    modalMessage: { fontSize: 16, color: theme.textSecondary, textAlign: 'center', marginBottom: 24 },
    modalButton: { backgroundColor: theme.primary, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 40 },
    modalButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default BCancerPredict;
