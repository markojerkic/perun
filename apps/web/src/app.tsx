import { createAsyncRoute, createRoute, Router } from "perun/src";
import { useCallback } from "preact/hooks";
import { z } from "zod";

const TestComponent = ({ lastname, id }: { lastname?: string; id: string }) => {
  return (
    <>
      <div className="bg-blue-200">
        <p>Prezime: {lastname}</p>
        <div>Id: {id}</div>
      </div>
    </>
  );
};

const TestComponent2 = ({
  country,
  player,
  queryParams,
}: {
  country: string;
  player: string;
  queryParams:
    | {
        ime: string;
        prezime?: string;
        godine: number;
      }
    | undefined;
}) => {
  const toPerson = useCallback(() => {
    routes.lastNameId.routeTo({ lastname: "jerkic" });
  }, []);
  return (
    <>
      <div className="bg-red-200">
        <p>Zemlja: {country}</p>
        <div>Igrač: {player}</div>
        <div>Query params: {JSON.stringify(queryParams)}</div>
        <button className="bg-blue-300" onClick={() => toPerson()}>
          Idemo na osobu jerkic
        </button>
        <routes.plyersCountry.Link
          country="HBZ"
          playername="STIPE"
          queryParams={{ godine: 38, ime: "Luka", prezime: "Modrić" }}
        >
          Na modrića
          <div className="h-screen">test</div>
        </routes.plyersCountry.Link>
        <div className="bg-violet-200 mb-10">
          <routes.plyersCountry.Link
            country="HBZ"
            playername="Stipe"
            queryParams={{ godine: 28, ime: "Luka", prezime: "Boban" }}
          >
            Test route
          </routes.plyersCountry.Link>
        </div>
      </div>
    </>
  );
};

export const routes = {
  plyersCountry: createRoute({
    routePattern: "/players/[country]/[playername]",
    searchParamsValidator: z.object({
      ime: z.string(),
      prezime: z.string().optional(),
      godine: z.number().min(20).max(40).optional().default(40),
    }),
    renderComponent: (props) => (
      <TestComponent2
        country={props.country}
        player={props.playername}
        queryParams={props.queryParams}
      />
    ),
  }),

  lastNameId: createRoute({
    routePattern: "/[id?]/ime/[lastname]",
    renderComponent: (props) => (
      <TestComponent lastname={props.lastname} id={props.id ?? "name id"} />
    ),
    searchParamsValidator: z.object({}),
  }),

  asyncRoute: createAsyncRoute({
    routePattern: "/async/[route]",
    renderComponent: (props) =>
      import("./async").then((module) => (
        <module.AsyncComponent route={props.route} />
      )),
    searchParamsValidator: z.object({}),
  }),
};

const NoRoutesMatch = () => {
  return <div>404, requested route is not defined :(</div>;
};

export const App = () => {
  const toPersonWithId = useCallback(() => {
    routes.lastNameId.routeTo({ id: "marko", lastname: "jerkic" });
  }, []);

  const toPerson = useCallback(() => {
    routes.lastNameId.routeTo({ lastname: "jerkic" });
  }, []);

  const toPlayer = useCallback(() => {
    routes.plyersCountry.routeTo({
      playername: "stipe",
      country: "hrv",
      queryParams: {
        godine: 22,
        ime: "Stipe",
        prezime: "Stipić",
      },
    });
  }, []);

  const toAsyncRoute = useCallback(() => {
    routes.asyncRoute.routeTo({ route: "neka" });
  }, []);

  return (
    <>
      <p>Bok, ovo je moj router :)</p>
      <div class="flex space-x-4 my-4">
        <routes.plyersCountry.Link
          playername="Marko"
          country="Hrvatska"
          queryParams={{ ime: "Marko", prezime: "Jerkić", godine: 22 }}
        >
          Na igrač marko ajde
        </routes.plyersCountry.Link>
        <button className="bg-red-300" onClick={() => toPlayer()}>
          Idemo na igrač stipe iz hrv
        </button>
        <button className="bg-blue-300" onClick={() => toPerson()}>
          Idemo na osobu jerkic
        </button>
        <button className="bg-blue-300" onClick={() => toPersonWithId()}>
          Idemo na osobu jerkic s identifikatorom
        </button>
        <button className="bg-fuchsia-300" onClick={() => toAsyncRoute()}>
          Idemo na async rutu
        </button>
      </div>
      <Router routes={routes}>
        <NoRoutesMatch />
      </Router>
    </>
  );
};
