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
      var beaconsApiRes = await getBeaconsToHearTo();
      console.log(beaconsApiRes)
      this.setState({ beaconsTohear: beaconsApiRes.beacons });
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
      this.sendMessage;
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

