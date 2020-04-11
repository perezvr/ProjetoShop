import multer from 'multer';
// Importando bilbioteca de criptografia
import crypto from 'crypto';
// Importando as duas funções do 'path do node'
// Extname => retorna o node da extensão de um arquivo
// Resolve => percorre um caminha na aplicação
import { extname, resolve } from 'path';

// Denifindo o método de upload do multer
export default {
  // Configurando caminho de gravação do arquivo
  // diskStorage => Opção para gravar arquivos no disco
  storage: multer.diskStorage({
    // Definindo o caminho para gravação dos arquivos
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),

    /**
     * filename é uma função para definir o nome do arquivo
     * req =>
     * file =>
     * cb =>
     */
    filename: (req, file, cb) => {
      /**
       * Criando uma sequência de bytes random para colocar como nome do arquivo
       * crypto.randomBytes => 2º parâmetro é uma função de callBabk onde o retorno
       * fica no parâmetro res
       */
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        /**
         * Transformando a seq. de bytes em uma string hexadecimal e concatenando
         * com a extensão original do arquivo para previvir qualquer caractere
         * estranho que possa estar no nome do arquivo
         */
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
