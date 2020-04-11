import File from '../models/File';

class FileController {
  // Método de gravação do File no db
  async store(req, res) {
    /**
     * => originalname => Retorna o nome original do arquivo que foi enviado no req de create
     * filename => Retorna o nome gerado pela multer para gravação do arquivo no tmp
     */
    const { originalname: name, filename: path } = req.file;

    // Gravação do file no db
    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
