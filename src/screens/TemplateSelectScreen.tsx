import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { BACKGROUND_TEMPLATES } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

type Props = NativeStackScreenProps<RootStackParamList, 'TemplateSelect'>;

const { width } = Dimensions.get('window');
const GAP = 12;
const ITEM_WIDTH = (width - 40 - GAP) / 2;

export default function TemplateSelectScreen({ route, navigation }: Props) {
    const { capturedImage } = route.params;
    const [selectedTemplateId, setSelectedTemplateId] = useState(BACKGROUND_TEMPLATES[0].id);

    const handleGenerate = () => {
        navigation.navigate('Result', {
            capturedImage,
            templateId: selectedTemplateId
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Select Your Vibe ✨</Text>
            </View>

            <View style={styles.previewContainer}>
                <Image source={{ uri: capturedImage }} style={styles.previewImage} resizeMode="cover" />
                {/* Overlay the selected color slightly to preview vibe */}
                <View style={[styles.overlay, { backgroundColor: BACKGROUND_TEMPLATES.find(t => t.id === selectedTemplateId)?.color, opacity: 0.2 }]} />
            </View>

            <View style={styles.selectionContainer}>
                <Text style={styles.sectionTitle}>Choose Background</Text>

                <View style={styles.gridContainer}>
                    {BACKGROUND_TEMPLATES.map((template) => (
                        <TouchableOpacity
                            key={template.id}
                            style={[
                                styles.templateCard,
                                selectedTemplateId === template.id && styles.templateCardSelected
                            ]}
                            onPress={() => setSelectedTemplateId(template.id)}
                        >
                            <ImageBackground
                                source={template.thumbnail}
                                style={styles.thumbnail}
                                imageStyle={{ borderRadius: 12 }}
                            >
                                {selectedTemplateId === template.id && (
                                    <View style={styles.selectedOverlay}>
                                        <Text style={styles.checkMark}>✓</Text>
                                    </View>
                                )}
                            </ImageBackground>
                            <Text style={[
                                styles.templateName,
                                selectedTemplateId === template.id && styles.templateNameSelected
                            ]}>{template.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.generateButtonContainer} onPress={handleGenerate}>
                    <LinearGradient
                        colors={['#8A2387', '#E94057', '#F27121']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.generateButton}
                    >
                        <Text style={styles.generateButtonText}>✨ Make it Pixar!</Text>
                    </LinearGradient>
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
    header: {
        padding: 20,
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    previewContainer: {
        width: width - 40,
        height: width * 0.8, // Slightly shorter preview
        alignSelf: 'center',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#333',
        backgroundColor: '#000',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    selectionContainer: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        marginBottom: 16,
        fontWeight: '600',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
    },
    templateCard: {
        width: ITEM_WIDTH,
        borderRadius: 16,
        backgroundColor: '#2a2a2a',
        padding: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    templateCardSelected: {
        borderColor: '#E94057',
        backgroundColor: '#333',
    },
    thumbnail: {
        width: '100%',
        aspectRatio: 16 / 9, // Wide thumbnails look better in grid
        borderRadius: 12,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(233, 64, 87, 0.4)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkMark: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    templateName: {
        color: '#aaa',
        fontSize: 13,
        fontWeight: '500',
        marginTop: 4,
    },
    templateNameSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    generateButtonContainer: {
        marginTop: 'auto',
        marginBottom: 40, // More bottom padding to avoid home bar
    },
    generateButton: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#E94057',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    generateButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
