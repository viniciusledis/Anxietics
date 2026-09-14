import '@expo/metro-runtime';
import { Text } from 'react-native';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// Apenas a prévia web precisa carregar o CanvasKit antes de importar o desenho.
export default function WebPreview() {
  return (
    <>
      {/* O canvas HTML interno do Skia 2.2 usa flex: 1; libera seu tamanho mínimo
        intrínseco para que ele também possa encolher ao redimensionar a prévia. */}
      <style>{'canvas { min-width: 0; min-height: 0; }'}</style>
      <WithSkiaWeb
        getComponent={() => import('../App')}
        opts={{ locateFile: () => '/canvaskit.wasm' }}
        fallback={<Text>Preparando os campos…</Text>}
      />
    </>
  );
}
