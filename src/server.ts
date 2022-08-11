import 'dotenv/config';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// import path from 'path';
// import fileUpload from 'express-fileupload';

(() => {
  const app = express();

  // miscellaneous
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
  app.use(helmet());

  // routes
  app.get('/', (_req: Request, res: Response) => {
    res.send(' <div><h1>God bless humanity!</h1></div>  ');
  });

  // connect to db
  const URI = process.env.MONGODB_URI_CLOUD!;
  mongoose.connect(
    URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    },
    (err) => {
      if (err) throw err;
      console.log('connected to db');
    }
  );

  const PORT = process.env.PORT ?? 4000;
  app.listen(PORT, () => {
    console.log(`server is running on port:${PORT}`);
  });
})();
