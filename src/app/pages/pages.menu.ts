export const PAGES_MENU = [
  {
    path: 'pages',
    children: [
      {
        path: 'dashboard',
        data: {
          menu: {
            title: 'Dashboard',
            icon: 'ion-android-home',
            selected: false,
            expanded: false,
            order: 0
          }
        }
      }
      , {
        path: 'vita',
        data: {
          menu: {
            title: 'ETL',
            icon: 'ion-android-upload',
            selected: false,
            expanded: false,
            order: 0
          }
        }
        , children: [
          {
            path: 'etl-activity',
            data: {
              menu: {
                title: '- Activity'
              }
            }
          }
        ]
      }
    ]
  }];

