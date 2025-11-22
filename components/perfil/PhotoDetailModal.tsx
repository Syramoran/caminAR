import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Modal, Portal, Text, IconButton, TextInput, Avatar, useTheme, Divider, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

interface Comment {
  id: number;
  comentario: string; // Nombre columna según tu esquema
  fecha_comentario: string; // Nombre columna según tu esquema
  usuario: {
    usuario: string;
    avatar_url: string | null;
  };
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
  photoUrl: string;
  photoId: number;
}

export const PhotoDetailModal = ({ visible, onDismiss, photoUrl, photoId }: Props) => {
  const theme = useTheme();
  const { userId } = useUser();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    if (visible && photoId) {
      fetchLikes();
      fetchComments();
    }
  }, [visible, photoId]);

  const fetchLikes = async () => {
    try {
      // Contar likes totales en foto_likes
      const { count } = await supabase
        .from('foto_likes')
        .select('*', { count: 'exact', head: true })
        .eq('foto_id', photoId);

      setLikesCount(count || 0);

      if (userId) {
        // Verificar si el usuario actual dio like
        const { data } = await supabase
          .from('foto_likes')
          .select('id')
          .eq('foto_id', photoId)
          .eq('usuario_id', userId)
          .maybeSingle(); // Usamos maybeSingle para evitar errores si no hay like
        setIsLiked(!!data);
      }
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      // Obtener comentarios de foto_comentarios con datos del usuario
      const { data, error } = await supabase
        .from('foto_comentarios')
        .select(`
          id,
          comentario,
          fecha_comentario,
          usuario:usuarios!fk_usuario_comentario (
            usuario,
            avatar_url
          )
        `)
        .eq('foto_id', photoId)
        .order('fecha_comentario', { ascending: true });

      if (error) throw error;

      // Mapeo manual para asegurar tipos
      const mappedComments = data.map((item: any) => ({
        id: item.id,
        comentario: item.comentario,
        fecha_comentario: item.fecha_comentario,
        usuario: item.usuario
      }));

      setComments(mappedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleLike = async () => {
    if (!userId) return;

    // Actualización optimista
    const previousLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      if (previousLiked) {
        await supabase.from('foto_likes').delete().eq('foto_id', photoId).eq('usuario_id', userId);
      } else {
        await supabase.from('foto_likes').insert({ foto_id: photoId, usuario_id: userId });
      }
    } catch (error) {
      setIsLiked(previousLiked); // Revertir en error
      setLikesCount(prev => previousLiked ? prev + 1 : prev - 1);
      console.error("Error toggling like:", error);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !userId) return;
    setSendingComment(true);
    try {
      const { error } = await supabase
        .from('foto_comentarios')
        .insert({
          foto_id: photoId,
          usuario_id: userId,
          comentario: newComment.trim()
        });

      if (error) throw error;
      setNewComment('');
      fetchComments(); // Recargar para mostrar el nuevo
    } catch (error) {
      console.error("Error sending comment:", error);
      Alert.alert("Error", "No se pudo enviar el comentario.");
    } finally {
      setSendingComment(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Avatar.Image size={32} source={{ uri: item.usuario.avatar_url || 'https://avatar.iran.liara.run/public' }} />
      <View style={styles.commentContent}>
        <Text style={styles.commentUser}>{item.usuario.usuario}</Text>
        <Text style={styles.commentText}>{item.comentario}</Text>
      </View>
    </View>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

          {/* Header Modal */}
          <View style={styles.header}>
            <IconButton icon="close" onPress={onDismiss} />
            <Text variant="titleMedium" style={{fontWeight: 'bold'}}>Publicación</Text>
            <View style={{width: 40}} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Imagen */}
            <Image source={{ uri: photoUrl }} style={styles.mainImage} resizeMode="cover" />

            {/* Barra de Acciones */}
            <View style={styles.actionsBar}>
              <View style={styles.likeContainer}>
                <IconButton
                    icon={isLiked ? "heart" : "heart-outline"}
                    iconColor={isLiked ? "#ED4956" : theme.colors.onSurface}
                    size={26}
                    onPress={handleToggleLike}
                    style={{margin: 0}}
                />
                <Text style={{fontWeight: '600', marginLeft: 4}}>{likesCount} Me gusta</Text>
              </View>
            </View>

            <Divider style={{marginVertical: 8}} />

            {/* Comentarios */}
            <View style={styles.commentsSection}>
              {loadingComments ? (
                <ActivityIndicator size="small" style={{marginTop: 20}} />
              ) : comments.length === 0 ? (
                <Text style={styles.emptyComments}>Aún no hay comentarios.</Text>
              ) : (
                  comments.map(comment => (
                      <View key={comment.id} style={styles.commentItemWrapper}>
                          {renderComment({ item: comment })}
                      </View>
                  ))
              )}
            </View>
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Añade un comentario..."
              value={newComment}
              onChangeText={setNewComment}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              style={styles.input}
              right={
                  <TextInput.Icon
                    icon={sendingComment ? "loading" : "send"}
                    onPress={handleSendComment}
                    disabled={sendingComment || !newComment.trim()}
                    color={theme.colors.primary}
                  />
              }
            />
          </View>

        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    flex: 1,
    margin: 0, // Fullscreen modal
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    height: Platform.OS === 'ios' ? 88 : 56,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  mainImage: {
    width: '100%',
    height: 400, // Altura considerable para ver bien la foto
    backgroundColor: '#f0f0f0',
  },
  actionsBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsSection: {
    paddingHorizontal: 16,
  },
  commentItemWrapper: {
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentContent: {
    marginLeft: 12,
    flex: 1,
  },
  commentUser: {
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#333',
  },
  emptyComments: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
  inputContainer: {
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    height: 45,
    fontSize: 14,
  }
});