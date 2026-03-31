import React, { useState, useEffect, useContext, useRef } from 'react';
import { API_BASE_URL } from '../config';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
};

export default function ChatScreen({ route }: any) {
  const { rideId, receiverId, receiverName } = route.params;
  const { token, user } = useContext(AuthContext);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages?rideId=${rideId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.warn("Error fetching messages:", e);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMessages();
    
    // Polling every 3 seconds for new messages (MVP Real-time alternative)
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const tempText = newMessage;
    setNewMessage(''); // optimistically clear

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: tempText,
          receiverId,
          rideId
        })
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (e) {
      console.warn("Failed to send message", e);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId === user?.id; // Assumes we have user.id in AuthContext (Requires updating AuthContext to include ID if not present)

    return (
      <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat con {receiverName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay mensajes aún. ¡Escribe el primero!</Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#A0AEC0"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
  },
  header: {
    padding: 16,
    backgroundColor: '#2D3748',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#4A5568',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    backgroundColor: '#4A5568',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    color: '#FFF',
    fontSize: 16,
  },
  emptyText: {
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#2D3748',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    color: '#FFF',
    padding: 12,
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#4ADE80',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#1A202C',
    fontWeight: 'bold',
  }
});
