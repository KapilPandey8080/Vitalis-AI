import React, { useEffect, useRef } from 'react';
import {
    Pressable,
    Text,
    View,
    StyleSheet,
    Animated,
    SafeAreaView,
    ScrollView,
    Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Path } from 'react-native-svg';

// --- Theme Colors ---
const theme = {
    primary: '#3A86FF',
    secondary: '#50E3C2',
    background: '#F0F4F8',
    surface: '#FFFFFF',
    text: '#1C2A3A',
    textSecondary: '#6E7D8C',
    shadow: 'rgba(58, 134, 255, 0.2)',
    shape1: 'rgba(58, 134, 255, 0.1)',
    shape2: 'rgba(80, 227, 194, 0.1)',
};

const { width, height } = Dimensions.get('window');

// --- Background Animation Component ---
// Creates a subtle, professional animation with floating shapes.
const BackgroundAnimation = () => {
    const anim1 = useRef(new Animated.Value(0)).current;
    const anim2 = useRef(new Animated.Value(0)).current;
    const anim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createLoop = (animation) =>
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animation, {
                        toValue: 1,
                        duration: 15000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animation, {
                        toValue: 0,
                        duration: 15000,
                        useNativeDriver: true,
                    }),
                ])
            );

        createLoop(anim1).start();
        setTimeout(() => createLoop(anim2).start(), 2000);
        setTimeout(() => createLoop(anim2).start(), 3000);
        setTimeout(() => createLoop(anim2).start(), 4000);
        setTimeout(() => createLoop(anim3).start(), 6000);
        setTimeout(() => createLoop(anim3).start(), 7000);
        setTimeout(() => createLoop(anim3).start(), 8000);
    }, [anim1, anim2, anim3]);

    const shape1Style = {
        transform: [
            { translateX: anim1.interpolate({ inputRange: [0, 1], outputRange: [-100, width] }) },
            { translateY: anim1.interpolate({ inputRange: [0, 1], outputRange: [height * 0.1, height * 0.4] }) },
            { rotate: anim1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
        ],
    };
    const shape2Style = {
        transform: [
            { translateX: anim2.interpolate({ inputRange: [0, 1], outputRange: [width, -100] }) },
            { translateY: anim2.interpolate({ inputRange: [0, 1], outputRange: [height * 0.6, height * 0.2] }) },
        ],
    };
    const shape3Style = {
        transform: [
            { translateY: anim3.interpolate({ inputRange: [0, 1], outputRange: [height, -100] }) },
            { translateX: anim3.interpolate({ inputRange: [0, 1], outputRange: [width * 0.8, width * 0.2] }) },
        ],
    };

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[styles.shape, styles.shape1, shape1Style]} />
            <Animated.View style={[styles.shape, styles.shape2, shape2Style]} />
            <Animated.View style={[styles.shape, styles.shape3, shape3Style]} />
        </View>
    );
};

// --- Header Illustration (SVG) ---
// A custom SVG icon to make the header more visually appealing.
const HealthIllustration = () => (
    <View style={styles.illustrationContainer}>
        <Svg height="80" width="80" viewBox="0 0 24 24">
            <Path
                fill={theme.primary}
                d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"
            />
            <Path
                fill="rgba(255, 255, 255, 0.8)"
                d="M12.5,10.25L14.5,12.25L11.5,15.25L9.5,13.25L6.5,16.25L5.5,15.25L9.5,11.25L11.5,13.25L13.5,11.25L12.5,10.25M17.5,10.25L18.5,11.25L15.5,14.25L14.5,13.25L17.5,10.25Z"
            />
        </Svg>
    </View>
);

// --- Reusable Animated Card Component ---
const PredictionCard = ({ item, index, navigation }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.stagger(100, [
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 150,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 150,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, slideAnim, index]);

    const handlePressIn = () => Animated.spring(scaleValue, { toValue: 0.96, useNativeDriver: true }).start();
    const handlePressOut = () => Animated.spring(scaleValue, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();

    return (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleValue }] }}>
            <Pressable
                style={styles.card}
                onPress={() => navigation.navigate(item.navigateTo)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            >
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Icon name={item.icon} size={30} color="#FFFFFF" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} color={theme.textSecondary} />
            </Pressable>
        </Animated.View>
    );
};

// --- Main HomeScreen Component ---
export const HomeScreen = () => {
    const navigation = useNavigation();

    const predictionModules = [
        { title: 'Breast Cancer', description: 'Analyze data for breast cancer.', icon: 'ribbon', color: '#FF9F43', navigateTo: 'BreastCancerPredict' },
        { title: 'Heart Disease', description: 'Predict the risk of heart disease.', icon: 'heart-pulse', color: '#FF6B6B', navigateTo: 'HeartDiseasePredict' },
        { title: 'Diabetes', description: 'Estimate the probability of diabetes.', icon: 'water-opacity', color: '#3A86FF', navigateTo: 'DiabetesPredict' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <BackgroundAnimation />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <HealthIllustration />
                    <Text style={styles.headerTitle}>Vitalis AI</Text>
                    <Text style={styles.headerSubtitle}>Intelligent Insights for a Healthier Tomorrow</Text>
                </View>

                <View style={{ marginTop: 60 }}>
                    {predictionModules.map((item, index) => (
                        <PredictionCard key={item.title} item={item} index={index} navigation={navigation} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    illustrationContainer: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: theme.text,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    card: {
        backgroundColor: theme.surface,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 7,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
    },
    cardDescription: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 2,
    },
    shape: {
        position: 'absolute',
        borderRadius: 100,
    },
    shape1: {
        width: 200,
        height: 200,
        backgroundColor: theme.shape1,
    },
    shape2: {
        width: 150,
        height: 150,
        backgroundColor: theme.shape2,
        borderRadius: 20,
    },
    shape3: {
        width: 80,
        height: 80,
        backgroundColor: theme.shape1,
    },
});
