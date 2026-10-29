import { router, useFocusEffect } from 'expo-router';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { db } from '../../firebaseConfig';
import { Resultado } from '../types/Resultado';

export default function Ranking() {
  const [lista, setLista] = useState<Resultado[]>([]);
  const [mensagem, setMensagem] = useState('');

  // Busca os resultados no Firebase e ordena
  const carregar = useCallback(async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'results'), orderBy('attempts'), limit(100)),
      );

      const resultados: Resultado[] = [];

      snapshot.forEach((partida) => {
        resultados.push({
          id: partida.id,
          ...partida.data(),
        } as Resultado);
      });

      // Menos tentativas primeiro; em caso de empate, ordem alfabética do nickname
      resultados.sort((a, b) => {
        if (a.attempts !== b.attempts) {
          return a.attempts - b.attempts;
        }
        return a.nickname.localeCompare(b.nickname);
      });

      setLista(resultados);
      setMensagem(resultados.length === 0 ? 'O ranking está vazio. Jogue uma partida!' : '');
    } catch (erro) {
      console.log('Erro ao consultar o ranking:', erro);
      setMensagem('Erro ao consultar o ranking.');
    }
  }, []);

  // Atualiza o ranking sempre que a tela recebe foco.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );
  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Ranking</Text>

      <Pressable style={estilos.botao} onPress={carregar}>
        <Text style={estilos.textoBotao}>Atualizar</Text>
      </Pressable>

      <Text style={estilos.mensagem}>{mensagem}</Text>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={estilos.cartao}>
            <Text style={estilos.posicao}>{index + 1}º</Text>
            <Text style={estilos.nickname}>{item.nickname}</Text>
            <Text style={estilos.texto}>{item.attempts} tentativas</Text>
          </View>
        )}
      />

      <Pressable style={estilos.botaoSecundario} onPress={() => router.back()}>
        <Text style={estilos.textoBotao}>Voltar ao Jogo</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  botao: {
    backgroundColor: '#005b96',
    padding: 15,
    borderRadius: 8,
  },
  botaoSecundario: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mensagem: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 5,
    borderLeftColor: '#005b96',
  },
  posicao: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 40,
  },
  nickname: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  texto: {
    fontSize: 15,
    color: '#333',
  },
});
