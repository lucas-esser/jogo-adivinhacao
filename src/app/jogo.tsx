import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { db } from '../../firebaseConfig';

export default function Jogo() {
  const [nickname, setNickname] = useState('');
  const [jogando, setJogando] = useState(false); // false = tela do nickname
  const [numeroSecreto, setNumeroSecreto] = useState(0);
  const [palpite, setPalpite] = useState('');
  const [tentativas, setTentativas] = useState(0);
  const [dica, setDica] = useState('');
  const [corDica, setCorDica] = useState('#2e8b57');
  const [venceu, setVenceu] = useState(false);
  const [mensagem, setMensagem] = useState('');

  // Trava o salvamento: impede gravar o mesmo resultado mais de uma vez
  const salvando = useRef(false);

  // Sorteia um novo número e zera a partida
  function novaPartida() {
    const numeroSorteado = Math.floor(Math.random() * 100) + 1;

    setNumeroSecreto(numeroSorteado);
    setPalpite('');
    setTentativas(0);
    setDica('');
    setVenceu(false);
    setMensagem('');
    salvando.current = false;
  }

  function iniciarPartida() {
    const nome = nickname.trim();

    if (nome === '') {
      setMensagem('Digite seu nickname para jogar!');
      return;
    }
    if (nome.length > 18) {
      setMensagem('O nickname deve ter no máximo 18 caracteres.');
      return;
    }

    setNickname(nome);
    novaPartida();
    setJogando(true);
  }

  // Volta para a tela do nickname para trocar de jogador
  function trocarNickname() {
    setJogando(false);
    setMensagem('');
  }

  // Grava a vitória no Firestore
  async function salvarResultado(totalTentativas: number) {
    try {
      await addDoc(collection(db, 'results'), {
        nickname,
        attempts: totalTentativas,
        createdAt: Date.now(),
      });

      setMensagem('Resultado salvo no ranking!');
    } catch (erro) {
      console.log('Erro ao salvar resultado:', erro);
      setMensagem('Erro ao salvar o resultado. Verifique o Firebase e a internet.');
    }
  }

  async function verificar() {
    // Partida já terminada: não faz nada
    if (venceu || salvando.current) {
      return;
    }

    const texto = palpite.trim();

    // Aceita só números inteiros de 1 a 100 (palpite inválido não conta tentativa)
    if (!/^[0-9]+$/.test(texto) || Number(texto) < 1 || Number(texto) > 100) {
      setDica('');
      setMensagem('Digite um número inteiro entre 1 e 100.');
      return;
    }

    const numero = Number(texto);
    const totalTentativas = tentativas + 1;

    setTentativas(totalTentativas);
    setPalpite('');
    setMensagem('');

    if (numero < numeroSecreto) {
      setDica('O número secreto é MAIOR!');
      setCorDica('#2e8b57');
    } else if (numero > numeroSecreto) {
      setDica('O número secreto é MENOR!');
      setCorDica('#c0392b');
    } else {
      // Acertou: encerra a partida e salva uma única vez
      setDica('');
      setVenceu(true);
      salvando.current = true;
      await salvarResultado(totalTentativas);
    }
  }

  // Tela 1: informar o nickname
  if (!jogando) {
    return (
      <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
        <Text style={estilos.titulo}>Jogo de Adivinhação</Text>
        <Text style={estilos.texto}>Descubra o número secreto entre 1 e 100.</Text>

        <TextInput
          style={estilos.campo}
          placeholder="Seu nickname"
          value={nickname}
          onChangeText={setNickname}
          maxLength={18}
        />

        <Pressable style={estilos.botao} onPress={iniciarPartida}>
          <Text style={estilos.textoBotao}>Iniciar Partida</Text>
        </Pressable>

        <Text style={estilos.mensagem}>{mensagem}</Text>

        <Pressable style={estilos.botaoSecundario} onPress={() => router.push('/ranking')}>
          <Text style={estilos.textoBotao}>Ver Ranking</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // Tela 2: partida em andamento
  return (
    <ScrollView contentContainerStyle={estilos.container} keyboardShouldPersistTaps="handled">
      <Text style={estilos.titulo}>Jogo de Adivinhação</Text>
      <Text style={estilos.texto}>Jogador: {nickname}</Text>
      <Text style={estilos.texto}>Tentativas: {tentativas}</Text>

      <TextInput
        style={estilos.campo}
        placeholder="Seu palpite (1 a 100)"
        keyboardType="number-pad"
        value={palpite}
        onChangeText={setPalpite}
        editable={!venceu}
      />

      <Pressable
        style={[estilos.botao, venceu && estilos.botaoDesativado]}
        onPress={verificar}
        disabled={venceu}
      >
        <Text style={estilos.textoBotao}>Verificar</Text>
      </Pressable>

      {dica !== '' && <Text style={[estilos.dica, { color: corDica }]}>{dica}</Text>}

      {venceu && (
        <View style={estilos.cartaoVitoria}>
          <Text style={estilos.tituloVitoria}>Você venceu! 🎉</Text>
          <Text style={estilos.texto}>O número secreto era {numeroSecreto}.</Text>
          <Text style={estilos.texto}>Tentativas utilizadas: {tentativas}</Text>
        </View>
      )}

      <Text style={estilos.mensagem}>{mensagem}</Text>

      {venceu && (
        <Pressable style={estilos.botao} onPress={novaPartida}>
          <Text style={estilos.textoBotao}>Nova Partida</Text>
        </Pressable>
      )}

      <Pressable style={estilos.botaoSecundario} onPress={() => router.push('/ranking')}>
        <Text style={estilos.textoBotao}>Ver Ranking</Text>
      </Pressable>

      <Pressable style={estilos.botaoSecundario} onPress={trocarNickname}>
        <Text style={estilos.textoBotao}>Trocar Nickname</Text>
      </Pressable>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  texto: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#005b96',
    padding: 15,
    borderRadius: 8,
  },
  botaoDesativado: {
    backgroundColor: '#999',
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
  dica: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  cartaoVitoria: {
    padding: 15,
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderLeftWidth: 5,
    borderLeftColor: '#2e8b57',
  },
  tituloVitoria: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e8b57',
    textAlign: 'center',
    marginBottom: 10,
  },
  mensagem: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 16,
  },
});
