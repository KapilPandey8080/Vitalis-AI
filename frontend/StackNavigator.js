import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./components/HomeScreen";
import BCancerPredict from "./components/BCancerPredict";
import HDiseasePredict from "./components/HDiseasePredict";
import DiabetesPredict from "./components/DiabetesPredict";
import PneumoniaPredict from "./components/PneumoniaPredict";

const StackNavigator = () => {
    const Stack = createNativeStackNavigator();

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="BreastCancerPredict"
                    component={BCancerPredict}
                    options={{ headerShown: true, headerTitle:'Breast Cancer Prediction' }}
                />
                <Stack.Screen
                    name="HeartDiseasePredict"
                    component={HDiseasePredict}
                    options={{ headerShown: true, headerTitle:'Heart Disease Prediction' }}
                />
                <Stack.Screen
                    name="DiabetesPredict"
                    component={DiabetesPredict}
                    options={{ headerShown: true, headerTitle:'Diabetes Prediction' }}
                />
                <Stack.Screen
                    name="PneumoniaPredict"
                    component={PneumoniaPredict}
                    options={{ headerShown: true, headerTitle:'Pneumonia Prediction' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default StackNavigator;