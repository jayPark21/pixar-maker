import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { PIXAR_PROMPT_TEMPLATE, BACKGROUND_TEMPLATES } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { generatePixarImage } from '../services/aiService';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export default function ResultScreen({ route, navigation }: Props) {
    const { capturedImage, templateId } = route.params;
    const [loading, setLoading] = useState(true);

    const template = BACKGROUND_TEMPLATES.find(t => t.id === templateId);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    useEffect(() => {
        const generate = async () => {
            try {
                const resultUrl = await generatePixarImage(capturedImage, template?.promptMod || '');
                setGeneratedImage(resultUrl);
            } catch (e) {
                console.error(e);
                Alert.alert("Error", "Failed to generate image. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        generate();
    }, [capturedImage, templateId]);

    const handleRetake = () => {
        navigation.navigate('Camera');
    };

    const handleSave = async () => {
        if (!generatedImage) return;

        if (Platform.OS === 'web') {
            try {
                // Web specific download logic
                const link = document.createElement('a');
                link.href = generatedImage;
                link.download = `pixar_${templateId}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                Alert.alert("Success", "Starting download...");
            } catch (error) {
                console.error("Web save error:", error);
                Alert.alert("Error", "Failed to download image.");
            }
            return;
        }

        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert("Permission required", "Please allow access to save photos.");
                return;
            }

            const base64Code = generatedImage.split('data:image/png;base64,')[1] || generatedImage;
            const filename = FileSystem.documentDirectory + "pixar_style.png";

            await FileSystem.writeAsStringAsync(filename, base64Code, {
                encoding: 'base64',
            });

            await MediaLibrary.createAssetAsync(filename);
            Alert.alert("Saved!", "Image saved to your gallery.");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to save image.");
        }
    };

    const handleShare = async () => {
        if (!generatedImage) return;

        if (Platform.OS === 'web') {
            // Check for Web Share API support (navigator.share)
            if (navigator.share) {
                try {
                    // Create a blob from base64 to share as a file if possible
                    const response = await fetch(generatedImage);
                    const blob = await response.blob();
                    const file = new File([blob], 'pixar_photo.png', { type: 'image/png' });

                    await navigator.share({
                        files: [file],
                        title: 'Look at my Pixar character!',
                        text: 'Created with Pixar Maker 🎨',
                    });
                } catch (error) {
                    console.log('Share failed:', error);
                    // Fallback to simple link sharing or just info
                    Alert.alert("Share", "Sharing not fully supported on this web browser, please use the Save button.");
                }
            } else {
                Alert.alert("Share", "Web Sharing API is not supported in this browser. Please use the Save button to download.");
            }
            return;
        }

        try {
            // Native Share
            if (await Sharing.isAvailableAsync()) {
                const base64Code = generatedImage.split('data:image/png;base64,')[1] || generatedImage;
                const filename = FileSystem.documentDirectory + "pixar_share.png";
                await FileSystem.writeAsStringAsync(filename, base64Code, { encoding: 'base64' });
                await Sharing.shareAsync(filename);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to share image.");
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={['#1a1a1a', '#000']}
                    style={StyleSheet.absoluteFill}
                />
                <ActivityIndicator size="large" color="#E94057" />
                <Text style={styles.loadingText}>Analysing Your Face...</Text>
                <Text style={styles.loadingSubText}>Consulting with Pixar Artists 🎨</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageContainer}>
                <Text style={styles.resultTitle}>Your Pixar Look</Text>
                <View style={styles.resultFrame}>
                    {/* 
                NOTE: This is where the AI Generated Image would go. 
                For the DEMO, we use a placeholder image to simulate the result.
            */}
                    <Image
                        source={{ uri: generatedImage || capturedImage }}
                        style={styles.resultImage}
                        resizeMode="cover"
                    />
                    {/* Result simulation overlay text */}
                    <View style={styles.simulationBadge}>
                        <Text style={styles.simulationText}>AI Generated ✨</Text>
                    </View>
                </View>
                <Text style={styles.promptLabel}>Applied Vibe: {template?.name}</Text>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleRetake}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleShare}>
                    <Text style={[styles.buttonText, styles.primaryButtonText]}>Share</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    loadingSubText: {
        color: '#888',
        marginTop: 8,
    },
    imageContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
    },
    resultTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    resultFrame: {
        width: '85%',
        aspectRatio: 4 / 5,
        borderRadius: 24,
        borderWidth: 4,
        borderColor: '#ffffff20',
        overflow: 'hidden',
        shadowColor: '#E94057',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        backgroundColor: '#000',
    },
    resultImage: {
        width: '100%',
        height: '100%',
    },
    simulationBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    simulationText: {
        color: 'white',
        fontSize: 10,
    },
    promptLabel: {
        color: '#aaa',
        marginTop: 20,
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        paddingBottom: 40,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        backgroundColor: '#444',
    },
    primaryButton: {
        backgroundColor: '#E94057',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
    primaryButtonText: {
        fontWeight: 'bold',
    },
});
