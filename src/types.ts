export type RootStackParamList = {
    Camera: undefined;
    TemplateSelect: { capturedImage: string }; // Image URI
    Result: { capturedImage: string; templateId: string };
};

export interface PixUser {
    id: string;
    name: string;
}
