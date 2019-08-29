/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment } from 'react';
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
import { Connection, Exchange, Queue } from 'react-native-rabbitmq';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.manager = new BleManager();
    this.state = {
      devices: [],
      beaconsTohear: []
    }
  }
  async componentDidMount() {
    try{
      // var beaconsApiRes = await getBeaconsToHearTo();
      var temp = [
        {
        "_id": "5d679ddc5e80ef00171ebc73",
        "uuid": "karthika",
        "macAdd": "6E:80:14:64:F0:E9",
        "latitude": 0,
        "longitude": 0,
        "floor": 0,
        "__v": 0
        },
        {
        "_id": "5d679e5c5e80ef00171ebc74",
        "uuid": "dhanoop",
        "macAdd": "74:92:0F:83:82:ED",
        "latitude": 90,
        "longitude": 0,
        "floor": 0,
        "__v": 0
        }
        ,
        {
        "_id": "5d679e5c5e80ef00171ebc74",
        "uuid": "Akhilesh",
        "macAdd": "44:DC:B7:FF:DC:52",
        "latitude": 90,
        "longitude": 90,
        "floor": 0,
        "__v": 0
        }];
      // console.log(beaconsApiRes)
      this.setState({ beaconsTohear: temp });
    } catch(e){
      console.log(e)
    }
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        console.log("powered on");
        this.scanAndConnect();
        subscription.remove();
      }
    }, true);
    this.initRabbit();
  }
  stopScan = () => {
    this.setState({ devices: [] });
    this.manager.stopDeviceScan();
  }
  scanAndConnect = () => {
    this.manager.startDeviceScan(null, { scanMode: "LowLatency" }, (error, device) => {
      if (error) {
        console.log(error)
        return
      } 
      if(this.state.beaconsTohear.map(a => a.macAdd).indexOf(device.id) < 0){
        return ;
      }
      var beacon = this.state.beaconsTohear[this.state.beaconsTohear.findIndex(val => val.macAdd === device.id)];
      console.log(beacon);
      this.sendMessage(beacon.macAdd, beacon.latitude, beacon.longitude, device.rssi);
      this.setState((prev) => {
        let found = prev.devices.map(d => d.id).indexOf(device.id);
        if (found >= 0) {
          prev.devices[found] = device;
          return {
            devices: [...prev.devices]
          }
        };
        return {
          devices: [...prev.devices, device]
        }
      })
    });
  }

  config = {
    host: '10.78.32.236',
    port: 5672,
    username: 'rtlsuser',
    password: 'rtlsuser',
    virtualhost: 'Test',
    //ttl: 10000, // Message time to live
    //ssl: true // Enable ssl connection, make sure the port is 5671 or an other ssl port
  };

  initRabbit() {
    console.log("starting mq");
    connection = new Connection(this.config);
    connection.connect()
    connection.on('error', (event) => {
      console.log(event)
    });

    connection.on('connected', (event) => {
      console.log("rabbit mq connected");
      let queue = new Queue(connection, {
        name: 'RTLSQueue',
        passive: false,
        durable: true,
        exclusive: false,
        consumer_arguments: { 'x-priority': 1 }
      });

      let exchange = new Exchange(connection, {
        name: 'amq.direct',
        type: 'direct',
        durable: true,
        autoDelete: false,
        internal: false
      });
      console.log(exchange, "------")
      queue.bind(exchange, 'RTLSQueue');

      // Receive one message when it arrives
      // queue.on('message', (data) => {
      //   console.log(data)

      // });

      // // Receive all messages send with in a second
      // queue.on('messages', (data) => {
      //   console.log(data)
      // });

      // let message = {
      //   macId: ""
      // };
      // let routing_key = 'RTLSQueue';
      // let properties = {
      //   expiration: 10000,
      //   contentType: "text/plain",
      //   deliveryMode: 1
      // }
      // exchange.publish(message, routing_key, properties)

      this.sendMessage = (macId, lat, lng, rssi) => {
        console.log(macId, lat, lng, rssi)
        let message = {
          macId,
          lat,
          lng,
          rssi
        };
        message = JSON.stringify(message);
        let routing_key = 'RTLSQueue';
        let properties = {
          expiration: 10000,
          contentType: "text/plain",
          deliveryMode: 1
        }
        console.log("SENDING MESSAGE", message)
        exchange.publish(message, routing_key, properties)
      }
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
              <Button onPress={this.stopScan} title="stop scan" />
              <Button onPress={this.scanAndConnect} title="start scan" />

              {this.state.devices.map((device, index) => {
                return <View key={index}>
                  <Text>
                    {device.id} {device.rssi}
                  </Text>
                  <Text style={{ height: 10, borderBottomWidth: 1 }}>
                  </Text>
                </View>
              })}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    );
  };
};

