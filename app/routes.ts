import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes';

export default [
  layout('./layouts/main/layout.tsx', [
    index('./routes/home/route.tsx'),
    route('gallery', './routes/gallery/route.tsx'),
    route('about', './routes/about/route.tsx'),
  ]),
] satisfies RouteConfig;
