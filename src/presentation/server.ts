import express, { Router } from "express";
import path from "path";

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}

export class Server {
  private app = express();
  private readonly routes: Router;
  private readonly port: number;
  private readonly public_path: string;

  constructor(options: Options) {
    const { port, routes, public_path = "public" } = options;
    this.port = port;
    this.public_path = public_path;
    this.routes = routes;
  }

  async start() {
    this.app.use(express.static("public"));

    //middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Routes
    this.app.use(this.routes);

    this.app.get("/{*splat}", (req, res) => {
      const indexPath = path.join(
        __dirname + `../../../${this.public_path}/index.html`
      );

      res.sendFile(indexPath);
    });

    this.app.listen(`${this.port}`, () => {
      console.log(`Server on port ${this.port}`);
    });
  }
}
