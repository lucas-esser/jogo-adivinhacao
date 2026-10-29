// Resultado de uma partida vencida (o id vem do documento do Firebase)
export type Resultado = {
  id: string;
  nickname: string;
  attempts: number;
  createdAt: number;
};
