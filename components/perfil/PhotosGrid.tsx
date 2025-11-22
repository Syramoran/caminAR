import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { PhotoDetailModal } from './PhotoDetailModal';

interface Photo {
  id: number;
  url_foto: string;
}

interface Props {
  userId: number; // Este es el ID del dueño del perfil que estamos viendo
}

const numColumns = 3;
const { width } = Dimensions.get('window');
const gap = 1;
const availableWidth = width - 32;
const imageSize = (availableWidth - (gap * (numColumns - 1))) / numColumns;

export const PhotosGrid = ({ userId }: Props) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('fotos_participaciones')
          .select('id, url_foto')
          .eq('usuario_id', userId)
          .order('fecha_subida', { ascending: false });

        if (error) throw error;
        setPhotos(data || []);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />;
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/685/685655.png' }}
            style={{ width: 50, height: 50, opacity: 0.4, marginBottom: 10, tintColor: theme.colors.outline }}
        />
        <Text style={{ color: theme.colors.outline, textAlign: 'center' }}>
            Sin publicaciones aún
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: gap }}
        contentContainerStyle={{ gap: gap }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedPhoto(item)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.url_foto }}
              style={{
                  width: imageSize,
                  height: imageSize,
                  backgroundColor: '#e1e1e1',
                  borderRadius: 2
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
      />

      {selectedPhoto && (
          <PhotoDetailModal
            visible={!!selectedPhoto}
            onDismiss={() => setSelectedPhoto(null)}
            photoUrl={selectedPhoto.url_foto}
            photoId={selectedPhoto.id}
            photoOwnerId={userId} // <--- ¡AQUÍ ESTABA EL FALTANTE! Pasamos el ID del dueño
          />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  }
});