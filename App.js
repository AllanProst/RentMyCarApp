import React from "react";
import { reduxForm, Field } from "redux-form";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  StyleSheet,
  Platform,
  Image,
  ImageBackground
} from "react-native";
import { List, ListItem } from 'react-native-elements'
import {
  StackNavigator,
  TabNavigator,
  DrawerNavigator
} from "react-navigation";
import MapView from "react-native-maps";
import Expo from "expo";
import { Ionicons } from "@expo/vector-icons";
import { Constants, Location, Permissions, Camera } from "expo";
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: "center"
  }
});

const list = [
  {
    name: 'Amy Farha',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
    subtitle: 'Vice President'
  },
  {
    name: 'Chris Jackson',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    subtitle: 'Vice Chairman'
  }
]


function MyTextInput(props) {
  return (
    <View>
      <TextInput
        onChangeText={props.input.onChange}
        value={props.input.value}
      />
    </View>
  );
}

function MyForm(props) {
  return (
    <ScrollView keyboardShouldPersistTaps={"handled"}>
      <Text>Nom du modele</Text>
      <Field name="modele" component={MyTextInput} />
      <Text>Marque</Text>
      <Field name="marque" component={MyTextInput} />
      <Text>Ville</Text>
      <Field name="ville" component={MyTextInput} />
      <Text>Nombre de Places</Text>
      <Field name="places" component={MyTextInput} />
      <TouchableOpacity onPress={props.handleSubmit}>
        <Text>Submit!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

var MyFormRedux = reduxForm({
  form: "signIn"
})(MyForm);

import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { createStore } from "redux";
import { Provider } from "react-redux";

const allReducers = combineReducers({ form: formReducer });
var store = createStore(allReducers);

class App extends React.Component {
  constructor() {
    super();
    this.state = {current : false, idcustomer : null};
    this.onSubmit = this.onSubmit.bind(this);
  }
  onSubmit(datas) {
    var ctx = this;
    var formData = new FormData();
    formData.append("modele", datas.modele);
    formData.append("marque", datas.marque);
    formData.append("ville", datas.ville);
    formData.append("places", datas.places);
    console.log(datas);
    fetch("https://peaceful-bastion-32552.herokuapp.com/signup", {
      method: "post",
      body: formData
    })
    .then(function(response) {
      return response.text();
    })
    .then(function(datas) {
      ctx.setState({ idcustomer : datas });
    })
    .then(ctx.setState({ current : true }));
  }
  
  render() {
      if (this.state.current == false){
        var whichstep = <MyFormRedux onSubmit={this.onSubmit} />
      }
      else if (this.state.current == true){
        var whichstep = <CameraExample id={this.state.idcustomer}/>
      }
    return (
      <Provider store={store}>
       {whichstep}
      </Provider>
    );
  }
}

class MyCarte extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: 48.8590505,
        longitude: 2.3500425,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      markers: [],
      location: {
        coords: {
          latitude: 48.8590505,
          longitude: 2.3500425
        }
      },
      errorMessage: null
    };
  }

  onRegionChange = region => {
    this.setState({ region: region });
  };

  componentWillMount() {
    var mythis = this;
    if (Platform.OS === "android" && !Constants.isDevice) {
      mythis.setState({
        errorMessage:
          "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      });
    } else {
      mythis._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied"
      });
    }

    let location = await Location.getCurrentPositionAsync({});

    this.setState({ location: location });
  };

  componentDidMount() {
    var monThis = this;
    fetch("https://peaceful-bastion-32552.herokuapp.com/getmarkers")
      .then(response => response.json())
      .then(function(datas) {
        console.log(datas);
        var newmarkers = [];
        for (var i = 0; i < datas.length; i++) {
          var newmarker = {
            latlng: {
              latitude: datas[i].latitude,
              longitude: datas[i].longitude
            },
            title: datas[i].marque,
            description: datas[i].modele,
            key: [i]
          };
          newmarkers.push(newmarker);
        }
        monThis.setState({ markers: newmarkers });
      })

      .catch(error => console.log(error));
  }

  render() {
    let text = "Waiting..";
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = JSON.stringify(this.state.location);
    }
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{text}</Text>
        <MapView
          style={styles.map}
          region={this.state.region}
          onRegionChange={this.onRegionChange}
        >
          {this.state.markers.map(marker => (
            <MapView.Marker
              key={marker.key}
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.description}
            />
          ))}
          {
            <MapView.Marker
              coordinate={this.state.location.coords}
              pinColor={"#474744"}
            />
          }
        </MapView>
       
      </View>
    );
  }
}

class CameraExample extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }

  takePicture = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      var formData = new FormData();
      formData.append("imgcar", {
        uri: photo.uri,
        name: this.state.idcustomer,
        type:"image/jpeg"
      })
      console.log("juste avant le save image");
      fetch("https://peaceful-bastion-32552.herokuapp.com/saveimage", {
        method: "POST",
        body: formData
      })
      .then((error)=> {console.log (error,"image ok")});
    }
  };
  
  
  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={this.state.type}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "row"
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: "flex-end",
                  alignItems: "center"
                }}
                onPress={this.takePicture.bind(this)}
              >
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: "white" }}
                >
                  SNAP
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}

class VehicleList extends React.Component {
  constructor() {
    super();
    this.state = {
      region: {
        latitude: 48.8590505,
        longitude: 2.3500425,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      markers: [],
      location: {
        coords: {
          latitude: 48.8590505,
          longitude: 2.3500425
        }
      },
      errorMessage: null
    };
  }

  componentDidMount() {
    var monThis = this;
    fetch("https://peaceful-bastion-32552.herokuapp.com/getmarkers")
      .then(response => response.json())
      .then(function(datas) {
        console.log(datas);
        var newmarkers = [];
        for (var i = 0; i < datas.length; i++) {
          var newmarker = {
            latlng: {
              latitude: datas[i].latitude,
              longitude: datas[i].longitude
            },
            title: datas[i].marque,
            description: datas[i].modele,
            key: [i]
          };
          newmarkers.push(newmarker);
        }
        monThis.setState({ markers: newmarkers });
      })
      .catch(error => console.log(error));
  }
  
  render() {
    return (
      <Provider store={store}>
        <List containerStyle={{marginBottom: 20}}>
  {
    this.state.markers.map((l, i) => (
      <ListItem
        roundAvatar
        avatar={{uri:l.avatar_url}}
        key={i}
        title={l.title}
        description={l.description}
      />
    ))
  }
</List>
      </Provider>
    );
  }
}

const RootNavigator = TabNavigator(
  {
    Home: {
      screen: App,
      navigationOptions: {
        tabBarLabel: "Home",
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={focused ? "ios-home" : "ios-home-outline"}
            size={26}
            style={{ color: tintColor }}
          />
        )
      }
    },
    Carte: {
      screen: MyCarte,
      navigationOptions: {
        tabBarLabel: "Carte",
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={focused ? "ios-map" : "ios-map-outline"}
            size={26}
            style={{ color: tintColor }}
          />
        )
      }
    },
    CameraExample: {
      screen: CameraExample,
      navigationOptions: {
        tabBarLabel: "Cam",
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={focused ? "ios-camera" : "ios-camera-outline"}
            size={26}
            style={{ color: tintColor }}
          />
        )
      }
    },
    VehicleList: {
      screen: VehicleList,
      navigationOptions: {
        tabBarLabel: "Vehicles",
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={focused ? "ios-car" : "ios-car-outline"}
            size={26}
            style={{ color: tintColor }}
          />
        )
      }
    },
  },
  

  {
    tabBarPosition: "bottom",
    animationEnabled: true,
    backgroundColor: "pink",
    tabBarOptions: {
      activeTintColor: "yellow",
      showIcon: true
    }
  }
);

class Main extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <RootNavigator />;
  }
}

export default Main;
