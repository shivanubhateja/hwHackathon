/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Fragment} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

import { BleManager } from 'react-native-ble-plx';
import { getBeaconsToHearTo } from './apiService';


export default class App extends React.Component {
  constructor(props){
    super(props);
    this.manager = new BleManager();
    this.state = {
      devices: [],
      beaconsTohear: []
    }
  }
  async componentDidMount() {
    try{
      var beaconsApiRes = await getBeaconsToHearTo();
      console.log(beaconsApiRes)
      this.setState({ beaconsTohear: beaconsApiRes.beacons });
    } catch(e){
      console.log(e)
    }
    const subscription = this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
            this.scanAndConnect();
            subscription.remove();
        }
    }, true);
}
stopScan = () => {
  this.manager.stopDeviceScan();
}
scanAndConnect() {
  this.manager.startDeviceScan(null, {scanMode: "LowLatency"}, (error, device) => {
      if (error) {
        console.log(error)
          return
      }
      console.log(device);
      this.setState((prev) => {
        let found = prev.devices.map(d => d.id).indexOf(device.id);
        console.log(found, "balle kaka.......");
        if(found >= 0){
          prev.devices[found] = device;
          return {
            devices: [ ...prev.devices ]
          }
        };
        return {
          devices: [ ...prev.devices, device]
        }
      })
  });
}
  render() {
    return (
      <Fragment>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic">
            <View>
              <Button onPress={this.stopScan} title="scan" />

              {this.state.devices.map((device, index) => {
                return <View key={index}>
                  <Text>
                    {device.id} {device.rssi}
                  </Text>
                  <Text style={{height: 10, borderBottomWidth: 1}}>
                  </Text>
                </View>
              })}
              <Text>dsf</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
  );
    };
};

