import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { BACKGROUND_TEMPLATES } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

type Props = NativeStackScreenProps<RootStackParamList, 'TemplateSelect'>;

const { width } = Dimensions.get('window');
// Calculate responsive item width based on container width constraint
const CONTAINER_MAX_WIDTH = 500;
const GAP = 10;

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
            <View style={styles.headerSpacer} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.contentWrapper}>
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: capturedImage }} style={styles.previewImage} resizeMode="cover" />
                        {/* Overlay the selected color slightly to preview vibe */}
                        <View style={[styles.overlay, { backgroundColor: BACKGROUND_TEMPLATES.find(t => t.id === selectedTemplateId)?.color, opacity: 0.15 }]} />
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
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.thumbnailContainer}>
                                        <Image
                                            source={template.thumbnail}
                                            style={styles.thumbnail}
                                            resizeMode="cover"
                                        />
                                        {selectedTemplateId === template.id && (
                                            <View style={styles.selectedOverlay}>
                                                <Text style={styles.checkMark}>✓</Text>
                                            </View>
                                        )}
                                    </View>
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
                        <Text style={styles.versionText}>v1.4 (Scrollable)</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    contentWrapper: {
        width: '100%',
        maxWidth: 500, // Constrain width on larger screens (web)
        alignSelf: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    headerSpacer: {
        height: 10,
    },
    previewContainer: {
        width: '100%',
        height: 220, // further reduced for small screens
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
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
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '700',
        marginLeft: 4,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        justifyContent: 'space-between',
    },
    templateCard: {
        width: '48%', // Responsive percentage width
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: '#252525',
        padding: 6,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    templateCardSelected: {
        borderColor: '#E94057',
        backgroundColor: '#333',
        transform: [{ scale: 1.02 }], // Subtle pop effect
    },
    thumbnailContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
        position: 'relative',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(233, 64, 87, 0.3)', // Lighter overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkMark: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    templateName: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    templateNameSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    generateButtonContainer: {
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
    },
    generateButton: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#E94057',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    generateButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    versionText: {
        color: '#666',
        textAlign: 'center',
        paddingVertical: 10,
        fontSize: 12,
    },
});
