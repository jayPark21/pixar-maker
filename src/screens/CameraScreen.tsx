import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera'; // Using modern CameraView
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { StatusBar } from 'expo-status-bar';

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

export default function CameraScreen() {
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const navigation = useNavigation<CameraScreenNavigationProp>();
    const [isTakingPicture, setIsTakingPicture] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
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
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const takePicture = async () => {
        if (cameraRef.current && !isTakingPicture) {
            setIsTakingPicture(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                    base64: false, // We usually just need the URI
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
            <CameraView
                style={styles.camera}
                facing={facing}
                ref={cameraRef}
            >
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
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
        color: 'white',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        padding: 20,
    },
    flipButton: {
        alignSelf: 'flex-end',
        marginTop: 40,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    bottomControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 40,
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
    },
    captureButtonActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        transform: [{ scale: 0.95 }]
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'white',
    }
});
