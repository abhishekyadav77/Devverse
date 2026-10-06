import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { csrfGuard } from './middleware/csrf.js';
import { notFound, errorHandler } from './middleware/error.js';
import routes from './routes/index.js';
import seoRoutes from './routes/seo.routes.js';

const app = express();

app.set('trust proxy', 1); // required behind Render/Railway proxies
app.disable('x-powered-by');

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-Requested-With'],
  })
);
app.use(compression());
if (!env.isProd) app.use(morgan('dev'));

// Public SEO endpoints: GET only, no cookies, no bodies
app.use(seoRoutes);

// Request size limits: article content and comments may be large, everything else is tiny.
// A request is parsed by the first matching parser, so the larger one is mounted first.
app.use('/api/blogs', express.json({ limit: '1mb' }));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strips $-operators and dotted keys from body, query and params

app.use('/api', apiLimiter, csrfGuard, routes);

app.use(notFound);
app.use(errorHandler);

export default app;