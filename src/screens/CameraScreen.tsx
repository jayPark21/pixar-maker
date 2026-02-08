import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { StatusBar } from 'expo-status-bar';

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

export default function CameraScreen() {
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const navigation = useNavigation<CameraScreenNavigationProp>();
    const [isTakingPicture, setIsTakingPicture] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(true);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraType() {
        setIsCameraReady(false);
        setFacing(current => (current === 'back' ? 'front' : 'back'));
        // Small delay to ensure clean unmount/remount on web
        setTimeout(() => setIsCameraReady(true), 500);
    }

    const takePicture = async () => {
        if (cameraRef.current && !isTakingPicture) {
            setIsTakingPicture(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false,
                });

                if (photo) {
                    console.log('Photo taken:', photo.uri);
                    navigation.navigate('TemplateSelect', { capturedImage: photo.uri });
                }
            } catch (error) {
                console.error("Failed to take picture:", error);
            } finally {
                setIsTakingPicture(false);
            }
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {isCameraReady ? (
                <CameraView
                    key={facing}
                    style={styles.camera}
                    facing={facing}
                    ref={cameraRef}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.buttonContainer}>
                            {/* Top Controls */}
                            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
                                <Text style={styles.text}>🔄</Text>
                            </TouchableOpacity>

                            {/* Bottom Controls */}
                            <View style={styles.bottomControls}>
                                <View style={styles.spacer} />
                                <TouchableOpacity
                                    style={[styles.captureButton, isTakingPicture && styles.captureButtonActive]}
                                    onPress={takePicture}
                                    disabled={isTakingPicture}
                                >
                                    <View style={styles.captureInner} />
                                </TouchableOpacity>
                                <View style={styles.spacer} />
                            </View>
                        </View>
                    </SafeAreaView>
                </CameraView>
            ) : (
                <View style={styles.loadingContainer}>
                    <Text style={styles.text}>Switching...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    camera: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
        width: '100%',
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        padding: 20,
    },
    flipButton: {
        alignSelf: 'flex-end',
        padding: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 30,
        marginTop: 10, // Small margin from safe area top
    },
    text: {
        fontSize: 24,
    },
    bottomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    spacer: {
        flex: 1,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    captureButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        transform: [{ scale: 0.95 }]
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
