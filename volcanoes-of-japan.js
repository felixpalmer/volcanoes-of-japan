// Initialize the engine with a location and inject into page
const container = document.getElementById( 'container' );
const peakList = document.getElementById( 'peak-list' );
const peakListOverlay = document.getElementById( 'peak-list-overlay' );
const stencilOverlay = document.getElementById( 'stencil' );
const title = document.getElementById( 'title' );
const subtitle = document.getElementById( 'subtitle' );

// Define API Keys (replace these with your own!)
const NASADEM_APIKEY = '12c27d08882df417c977cf5af64fd84f0';
if ( !NASADEM_APIKEY ) {
  const error = Error( 'Modify index.html to include API keys' );
  container.innerHTML = error; 
  throw error;
}

const datasource = {
  elevation: {
    apiKey: NASADEM_APIKEY
  },
  imagery: {
    urlFormat: 'https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png',
    attribution: 'Tiles: <a href="https://www.gsi.go.jp/bousaichiri/hillshademap.html">gis.go.jp</a> (hillshade)'
  }
}
Procedural.init( { container, datasource } );

// Configure buttons for UI
Procedural.setCompassVisible( false );

// Define function for loading a given peak
function loadPeak( feature ) {
  const { name } = feature.properties;
  const [longitude, latitude] = feature.geometry.coordinates;
  Procedural.displayLocation( { latitude, longitude } );
  title.innerHTML = '<';
  title.classList.remove( 'hidden' );
  peakListOverlay.classList.add( 'hidden' );
  stencilOverlay.classList.remove( 'hidden' );

  const overlay = {
    "name": "peak",
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": feature.geometry,
        "properties": {
          "name": `${name}`,
          "background": "rgba(35,46,50,1)",
          "fontSize": 18,
          "padding": 10,
          "anchorOffset": { "y": 86, "x": 0 }
        }
      },
      {
        "type": "Feature",
        "geometry": feature.geometry,
        "properties": {
          "image": "_",
          "background": "rgba(255, 255, 255, 0.5)",
          "width": 0,
          "height": 30,
          "padding": 1,
          "anchor": "bottom",
          "anchorOffset": { "y": 39, "x": 0 }
        }
      }
    ]
  }

  Procedural.addOverlay( overlay );
  setTimeout( () => Procedural.orbitTarget(), 1000 );
}

// Show list when title clicked
title.addEventListener( 'click', () => {
  title.classList.add( 'hidden' );
  peakListOverlay.classList.remove( 'hidden' );
  stencilOverlay.classList.add( 'hidden' );
} );

// Fetch peak list and populate UI
fetch( 'volcanoes.geojson' )
  .then( data => data.json() )
  .then( volcanoes => {
    // Display first peak
    const [longitude, latitude] = volcanoes.features[ 0 ].geometry.coordinates;
    Procedural.displayLocation( { latitude, longitude } );

    volcanoes.features.forEach( (peak, i) => {
      const li = document.createElement( 'li' );
      let p = document.createElement( 'p' );
      p.innerHTML = peak.properties.name;
      li.appendChild( p );
      p = document.createElement( 'p' );
      p.innerHTML = '';
      li.appendChild( p );
      peakList.appendChild( li );
      li.addEventListener( 'click', () => loadPeak( peak ) );
    } );
    peakListOverlay.classList.remove( 'hidden' );

    // Add overlay showing all volcanoes
    const overlay = {
      "name": "dots",
      "type": "FeatureCollection",
      "features": volcanoes.features.map( (feature, i) => ( {
        "id": i,
        "type": "Feature",
        "geometry": feature.geometry,
        "properties": {
          "name": "",
          "background": "rgba(255, 255, 255, 0.7)",
          "borderRadius": 16,
          "padding": 4,
        }
      } ) )
    }
    Procedural.addOverlay( overlay );

    // Move view to peak when marker clicked
    Procedural.onFeatureClicked = id => {
      const peak = volcanoes.features[ id ];
      if ( peak ) { loadPeak( peak ) }
    }
  } );
