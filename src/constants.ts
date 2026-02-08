export const PIXAR_PROMPT_TEMPLATE =
    "A cute, highly stylized 3D caricature of a person, featuring a slightly oversized head, big glossy eyes, and soft rounded facial features. Rendered in a clean Pixar-inspired style with smooth textures and gentle ambient lighting. Subtle shadows and a simple pastel background keep the focus entirely on the character’s charm.";

export interface BackgroundTemplate {
    id: string;
    name: string;
    color: string;
    thumbnail: any; // Local image require
    promptMod: string; // Background specific prompt additions
}

export const BACKGROUND_TEMPLATES: BackgroundTemplate[] = [
    {
        id: 'pastel-pink', // Revert ID
        name: '러블리 핑크', // Lovely Pink
        color: '#FFDEE9',
        thumbnail: require('../assets/thumb_pink_v2.jpg'),
        promptMod: 'Background is soft pastel pink with a dreamy, romantic atmosphere and gentle lighting. The character is wearing cute, casual pastel-colored clothes.',
    },
    {
        id: 'sahara-desert',
        name: '사막 탐험',
        color: '#FF9800',
        thumbnail: require('../assets/thumb_desert.jpg'),
        promptMod: 'Background is a vast, sunny desert with golden sand dunes and a bright blue sky. The character is wearing an adventurous explorer outfit with a scarf.',
    },
    {
        id: 'k-sauna',
        name: '찜질방',
        color: '#8D6E63',
        thumbnail: require('../assets/thumb_sauna.jpg'),
        promptMod: 'Background is inside a cozy wooden room with warm lighting. The character is wearing a white fluffy head-wrap with two cute round buns on the sides (resembling sheep ears), and wearing comfy orange loungewear t-shirt and pants.',
    },
    {
        id: 'seoul-night',
        name: '서울의 밤',
        color: '#1A237E',
        thumbnail: require('../assets/thumb_seoul.png'),
        promptMod: 'Background is at the observation deck of Namsan Seoul Tower with a beautiful panoramic view of the sparkling city night lights.',
    },
];
