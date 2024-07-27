# anotherbush

## Available Tools

### React

1. ModalController

- Dynamically render custom component by calling present function.

- Handling the modal lifecycle and allow to use the custom result of the response.

```tsx
import { createModalController } from '@anotherbush/react';

const modalCtrl = createModalController();

function MyComponent() {
  return (
    <div>
      <button
        type="button"
        onClick={async () => {
          const userConsent: boolean = await modalCtrl
            .present<{ consent: boolean }>({
              canDismiss: true, // false will lock the window
              disableBackdropDismiss: true, // true will omit the backdrop click event
              // backdropClassName:
              // backdropStyle
              // className
              // style
              // animation
              onInit: (e) => console.log(e),
              onViewInit: (e) => console.log(e),
              onWillPresent: (e) => console.log(e),
              onDidPresent: (e) => console.log(e),
              onWillDismiss: (e) => console.log(e),
              onDidDismiss: (e) => console.log(e),
              onDestroy: (e) => console.log(e),
              render: (modal) => (
                <div
                  style={{
                    width: '80vw',
                    height: '80vh',
                    borderRadius: '20px',
                    backgroundColor: 'red',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      modal.dismiss(false, {
                        data: { consent: false },
                        error: new Error('reject '),
                      });
                    }}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      modal.dismiss(true, {
                        data: { consent: true },
                      });
                    }}
                  >
                    Grant
                  </button>
                </div>
              ),
            })
            .then((res) => {
              // Consent got granted.
              console.log(res?.data); // { consent: true }
              return true;
            })
            .catch((ex) => {
              // Consent got rejected.
              console.log(ex?.data); // { consent: false }
              return false;
            });

          if (userConsent) {
            console.log('user grant');
            // startTransaction() ...
          } else {
            console.log('user reject');
          }
        }}
      >
        First check the consent from user then start the transaction if granted
        else do nothing .
      </button>
    </div>
  );
}
```

1. ObservableStore

- High performance flux pattern store.

```tsx
import { createStore, useWatchStore } from '@anotherbush/react';

interface MyClientStore {
  name: string;
  description: string;
  age: number;
}

const {
  Provider: MyClientStoreProvider,
  useStore: useMyClientStore
} = createStore<MyClientStore>();

// layout.tsx
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MyClientStoreProvider
          value={{
            name: 'Tim',
            description: '',
            age: 20,
          }}
        >
          {children}
        </MyClientStoreProvider>
      </body>
    </html>
  );
}

function AppRootPage() {
  const store = useMyClientStore();
  // able to listening the changes.
  const name = useWatchStore(store, 'name');

  return (
    <div>
      <SubComponent />
      {name} 
    </div>
  );
}

function SubComponent() {
  const store = useMyClientStore();
  return (
    <div>
    <input type="text" onInput={e => {
      store.set('name', (prevName) => {
        console.log(prevName); // Tim
        return 'Amy';
      });
      // or
      // store.set('name', 'Amy');
    }} />
    </div>
  );
}



```

### Utils

### Next
