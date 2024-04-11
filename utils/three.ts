import { Cache, TextureLoader, Scene, Material, Renderer, Object3D, Light, DirectionalLight, AmbientLight } from 'three';
import { DRACOLoader, GLTFLoader } from 'three-stdlib';

// Enable caching for all loaders
Cache.enabled = true;

const dracoLoader = new DRACOLoader();
const gltfLoader = new GLTFLoader();
dracoLoader.setDecoderPath('/draco/');
gltfLoader.setDRACOLoader(dracoLoader);

/**
 * GLTF model loader configured with draco decoder
 */
export const modelLoader = gltfLoader;
export const textureLoader = new TextureLoader();

/**
 * Clean up a scene's materials and geometry
 */
export const cleanScene = (scene: Scene | undefined) => {
  scene?.traverse((object: Object3D) => {
    //@ts-ignore
    if (!object.isMesh) return;

    //@ts-ignore
    object.geometry.dispose();

    //@ts-ignore
    if (object.material.isMaterial) {
      //@ts-ignore
      cleanMaterial(object.material);
    } else {
      //@ts-ignore
      for (const material of object.material) {
        cleanMaterial(material);
      }
    }
  });
};

/**
 * Clean up and dispose of a material
 */
export const cleanMaterial = (material: Material) => {
  material.dispose();

  for (const key of Object.keys(material)) {
    //@ts-ignore
    const value = material[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      //@ts-ignore
      (value as TextureLoader).dispose();

      // Close GLTF bitmap textures
      (value as any).source?.data?.close?.();
    }
  }
};

/**
 * Clean up and dispose of a renderer
 */
export const cleanRenderer = (renderer: Renderer | undefined) => {
  //@ts-ignore
  renderer.dispose();
};

/**
 * Clean up lights by removing them from their parent
 */
export const removeLights = (lights: (DirectionalLight | AmbientLight)[] | undefined) => {
  for (const light of lights ?? []) {
    light.parent?.remove(light);
  }
};

/**
 * Get child by name
 */
export const getChild = (name: string, object: Object3D) => {
  let node: Object3D | undefined;

  object.traverse((child: Object3D) => {
    if (child.name === name) {
      node = child;
    }
  });

  return node;
};
