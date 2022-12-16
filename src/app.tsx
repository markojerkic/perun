import { Router } from './router';

export function App() {

  const {createRoute} = Router();
  const resp = createRoute({route: '/:en/test', params: {lng: 'en'}});

  return (
    <>
      <div className="text-xl">{resp}</div>
    </>
  )
}
