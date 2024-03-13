/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Alert,
  Platform,
  ActionSheetIOS,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  WLJSONStore,
  JSONStoreCollection,
  JSONStoreQueryPart,
  JSONStoreInitOptions,
  JSONStoreSyncPolicy,
  JSONStoreAddOptions,
} from 'react-native-ibm-mobilefirst-jsonstore';
import {Picker} from '@react-native-picker/picker';
import colors from './src/assets/styles/colors';

const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

const BUTTONS_IOS_ACTIONSHEET_LABELS = [
  'Initialize Collection',
  'Add Document',
  'Remove Document',
  'Find Document',
  'Count Document',
  'Clear Collection',
  'Remove Collection',
];

const BUTTONS_IOS_ACTIONSHEET_OPERATIONS = [
  'initCollection',
  'add',
  'remove',
  'find',
  'count',
  'clearCollection',
  'removeCollection',
];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operation: BUTTONS_IOS_ACTIONSHEET_OPERATIONS[0],
      addDataModel: {
        name: '',
        age: '',
      },
      removeDataModel: {
        id: '',
      },
      findQueryModel: {
        query: '',
      },
      countQueryModel: {
        query: '',
      },
      result: '',
      iosButtonTitle: BUTTONS_IOS_ACTIONSHEET_LABELS[0],
    };

    // views
    this.returnPickerView = this.returnPickerView.bind(this);
    this.returnOperationDetailView = this.returnOperationDetailView.bind(this);
    this.changePickerItem = this.changePickerItem.bind(this);

    // operations
    this.initialize = this.initialize.bind(this);
    this.addDocument = this.addDocument.bind(this);
    this.removeDocument = this.removeDocument.bind(this);
    this.findDocuments = this.findDocuments.bind(this);
    this.findDocumentsByAge = this.findDocumentsByAge.bind(this);
    this.findDocumentsByName = this.findDocumentsByName.bind(this);
    this.findDocumentById = this.findDocumentById.bind(this);
    this.countDocuments = this.countDocuments.bind(this);
    this.countDocumentsByAge = this.countDocumentsByAge.bind(this);
    this.countDocumentsByName = this.countDocumentsByName.bind(this);
    this.clearCollection = this.clearCollection.bind(this);
    this.removeCollection = this.removeCollection.bind(this);
    this.showActionSheet = this.showActionSheet.bind(this);
  }

  initialize() {
    var collection = new JSONStoreCollection('people');
    collection.setSearchField('name', 'string');
    collection.setSearchField('age', 'number');
    var options = new JSONStoreInitOptions();
    options.setSyncOptions(
      JSONStoreSyncPolicy.SYNC_UPSTREAM,
      'JSONStoreCloudantSync',
    );
    WLJSONStore.openCollections(['people'], options)
      // WLJSONStore.openCollections(["people"])
      .then(res => {
        this.setState({result: SUCCESS + '\n' + res});
      })
      .catch(err => {
        this.setState({result: FAILURE + '\n' + err});
      });
  }

  addDocument() {
    var name = this.state.addDataModel.name.trim();
    var age = this.state.addDataModel.age.trim();
    if (name.length > 0 && age.length > 0) {
      if (isNaN(Number(age))) {
        Alert.alert('Please enter a valid Age.');
      }
      var data = {
        name: this.state.addDataModel.name.trim(),
        age: Number(this.state.addDataModel.age.trim()),
      };
      var options = new JSONStoreAddOptions(true);
      var collection = new JSONStoreCollection('people');
      collection
        .addData(data, options)
        .then(res => {
          this.setState({
            result:
              SUCCESS +
              '\nDocument ' +
              JSON.stringify(data) +
              ' added successfully.',
            addDataModel: {name: '', age: ''},
          });
        })
        .catch(err => {
          this.setState({
            result: FAILURE + '\n' + err,
            addDataModel: {name: '', age: ''},
          });
        });
    }
  }

  removeDocument() {
    if (this.state.removeDataModel.id.length > 0) {
      var id = Number(this.state.removeDataModel.id);
      var collection = new JSONStoreCollection('people');
      collection
        .removeDocumentById(id)
        .then(res => {
          if (res == 1) {
            this.setState({
              result:
                SUCCESS + '\nDocument with id ' + id + ' successully removed.',
              removeDataModel: {id: ''},
            });
          } else {
            this.setState({
              result: SUCCESS + '\nDocument with id ' + id + " doesn't exist.",
              removeDataModel: {id: ''},
            });
          }
        })
        .catch(err => {
          this.setState({
            result: FAILURE + '\n' + err,
            removeDataModel: {id: ''},
          });
        });
    }
  }

  countDocuments() {
    var collection = new JSONStoreCollection('people');
    collection
      .countAllDocuments()
      .then(res => {
        this.setState({
          result: SUCCESS + '\nTotal Count of Documents present: ' + res,
          countQueryModel: {query: ''},
        });
      })
      .catch(err => {
        this.setState({
          result: FAILURE + '\n' + err,
          countQueryModel: {query: ''},
        });
      });
  }

  countDocumentsByName() {
    var name = this.state.countQueryModel.query.trim();
    if (name.length == 0) {
      Alert.alert('Please enter a valid Name.');
      return;
    }
    var collection = new JSONStoreCollection('people');
    var query = new JSONStoreQueryPart();
    query.addLike('name', name);
    collection
      .countDocuments([query])
      .then(res => {
        this.setState({
          result:
            SUCCESS +
            '\nCount of Documents found with "name" containing: ' +
            name +
            '\n is: ' +
            res,
          countQueryModel: {query: ''},
        });
      })
      .catch(err => {
        this.setState({
          result: FAILURE + '\n' + err,
          countQueryModel: {query: ''},
        });
      });
  }

  countDocumentsByAge() {
    var age = this.state.countQueryModel.query.trim();
    if (age.length == 0 || isNaN(Number(age))) {
      Alert.alert('Please enter a valid Age.');
      return;
    }
    var collection = new JSONStoreCollection('people');
    var query = new JSONStoreQueryPart();
    query.addEqual('age', Number(age));
    collection
      .countDocuments([query])
      .then(res => {
        this.setState({
          result:
            SUCCESS +
            '\nCount of Documents found with "age": ' +
            age +
            '\n is: ' +
            res,
          countQueryModel: {query: ''},
        });
      })
      .catch(err => {
        this.setState({
          result: FAILURE + '\n' + err,
          countQueryModel: {query: ''},
        });
      });
  }

  findDocuments() {
    var collection = new JSONStoreCollection('people');
    collection
      .findAllDocuments()
      .then(res => {
        this.setState({
          result: SUCCESS + '\nAll Documents: ' + '\n' + JSON.stringify(res),
          findQueryModel: {query: ''},
        });
      })
      .catch(err => {
        this.setState({
          result: FAILURE + '\n' + err,
          findQueryModel: {query: ''},
        });
      });
  }

  findDocumentsByAge() {
    var age = this.state.findQueryModel.query.trim();
    if (age.length == 0 || isNaN(Number(age))) {
      Alert.alert('Please enter a valid Age.');
      return;
    }
    var collection = new JSONStoreCollection('people');
    var query = new JSONStoreQueryPart();
    query.addEqual('age', Number(age));
    collection
      .findDocuments([query])
      .then(res => {
        this.setState({
          result:
            SUCCESS +
            '\nDocuments found with "age": ' +
            age +
            '\n' +
            JSON.stringify(res),
          findQueryModel: {query: ''},
        });
      })
      .catch(err => {
        this.setState({
          result: FAILURE + '\n' + err,
          findQueryModel: {query: ''},
        });
      });
  }

  findDocumentsByName() {
    var name = this.state.findQueryModel.query.trim();
    if (name.length == 0) {
      Alert.alert('Please enter a valid Name.');
      return;
    }
    var collection = new JSONStoreCollection('people');
    var query = new JSONStoreQueryPart();
    query.addLike('name', name);
    collection
      .findDocuments([query])
      .then(res => {
        this.setState({
          result:
            SUCCESS +
            '\nDocuments found with "name" containing: ' +
            name +
            '\n' +
            JSON.stringify(res),
          findQueryModel: {query: ''},
        });
      })
      .catch(err => {
        this.setState({
          result: FAILURE + '\n' + err,
          findQueryModel: {query: ''},
        });
      });
  }

  findDocumentById() {
    var id = this.state.findQueryModel.query.trim();
    if (id.length == 0 || isNaN(Number(id))) {
      Alert.alert('Please enter a valid ID.');
      return;
    }
    var collection = new JSONStoreCollection('people');
    collection
      .findDocumentById(Number(id))
      .then(res => {
        if (res == '') {
          this.setState({
            result: SUCCESS + '\nNo Document found with id: ' + id,
            findQueryModel: {query: ''},
          });
        } else {
          this.setState({
            result:
              SUCCESS +
              '\nDocument found with id: ' +
              id +
              '\n' +
              JSON.stringify(res),
            findQueryModel: {query: ''},
          });
        }
      })
      .catch(err => {
        this.setState({
          result: FAILURE + '\n' + err,
          findQueryModel: {query: ''},
        });
      });
  }

  clearCollection() {
    var collection = new JSONStoreCollection('people');
    collection
      .clearCollection()
      .then(res => {
        this.setState({result: SUCCESS + '\n' + res});
      })
      .catch(err => {
        this.setState({result: FAILURE + '\n' + err});
      });
  }

  removeCollection() {
    var collection = new JSONStoreCollection('people');
    collection
      .removeCollection()
      .then(res => {
        this.setState({result: SUCCESS + '\n' + res});
      })
      .catch(err => {
        this.setState({result: FAILURE + '\n' + err});
      });
  }

  changePickerItem(itemValue) {
    this.setState({
      operation: itemValue,
      result: '',
    });
  }

  returnPickerView() {
    if (Platform.OS === 'ios') {
      return (
        <View
          style={{
            borderStyle: 'solid',
            borderColor: 'gray',
            backgroundColor: 'white',
            borderWidth: 1,
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <TouchableOpacity onPress={this.showActionSheet}>
            <View style={styles.buttonStyle}>
              <Text style={styles.textStyle}>{this.state.iosButtonTitle}</Text>
            </View>
          </TouchableOpacity>
          <Image
            style={{width: 20, height: 20, alignSelf: 'center'}}
            source={{
              uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADXSURBVGhD7c9NCsIwGIThgCt3LvROeiZBD+AZXOl96nHc6aR0QCSVtvn7IvPCEAJZ5HFKKaWUUqpo6+G02qT/bbEOO/c3e+2wB3bqbyNtMI94DbOGIYL/O2LBVtgd40NLmG/EEztgo1nEzEYwS5jFCGYBE41gNTHJEKwGJoTYY9GVxGRDsBKY7AiWE1MMwXJgiiNYSkw1BEuBqY5gMRgzCLYEYw7B5mDMItgUjHkE+4VpBsFCmAvWFIKFMM0hmMfcsKYR7BPTLIJ5zBVrGqGUUkoppf4i5962ta4MW9O7rQAAAABJRU5ErkJggg==',
            }}
          />
        </View>
      );
    } else {
      return (
        <Picker
          selectedValue={this.state.operation}
          style={{height: '10%', width: '100%'}}
          onValueChange={(itemValue, itemIndex) =>
            this.changePickerItem(itemValue)
          }>
          <Picker.Item label="Initialize Collection" value="initCollection" />
          <Picker.Item label="Add Document" value="add" />
          <Picker.Item label="Remove Document" value="remove" />
          <Picker.Item label="Find Document" value="find" />
          <Picker.Item label="Count Document" value="count" />
          <Picker.Item label="Clear Collection" value="clearCollection" />
          <Picker.Item label="Remove Collection" value="removeCollection" />
        </Picker>
      );
    }
  }

  showActionSheet() {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: BUTTONS_IOS_ACTIONSHEET_LABELS,
      },
      buttonIndex => {
        this.setState({
          iosButtonTitle: BUTTONS_IOS_ACTIONSHEET_LABELS[buttonIndex],
          operation: BUTTONS_IOS_ACTIONSHEET_OPERATIONS[buttonIndex],
        });
      },
    );
  }

  returnOperationDetailView() {
    // initCollection, add, remove, find, count, clearCollection, removeCollection,
    switch (this.state.operation) {
      case 'initCollection':
        return (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              // justifyContent: "center",
              width: '100%',
              padding: 10,
            }}>
            {/* <Button
              title="Click to Initialize"
              color="purple"
              onPress={this.initialize}
            /> */}
            {/* <AwesomeButton
              stretch
              progress
              backgroundColor="#56e016"
              backgroundProgress="#31800d"
              backgroundShadow="yellow"
              borderRadius={200}
              // textSize={20}
              onPress={next => {
                this.initialize();
                next();
              }}
            >
              initialize
            </AwesomeButton>
            <AwesomeButtonRick
              type="primary"
              // stretch
              progress
              // textSize={20}
              onPress={next => {
                this.initialize();
                next();
              }}
            >
              Rick's Primary Button
            </AwesomeButtonRick> */}
            <TouchableOpacity
              onPress={next => {
                this.initialize();
                //next();
              }}>
              <View style={styles.buttonStyle}>
                <Text style={styles.textStyle}>Initialize</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'add':
        return (
          <View
            style={{
              flex: 1,
              width: '100%',
              padding: 10,
            }}>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={text =>
                this.setState({
                  addDataModel: {name: text, age: this.state.addDataModel.age},
                })
              }
              value={this.state.addDataModel.name}
              placeholder="Enter Name here"
              textContentType="name"
            />
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginVertical: 5,
              }}
              onChangeText={text =>
                this.setState({
                  addDataModel: {
                    age: text,
                    name: this.state.addDataModel.name,
                  },
                })
              }
              value={this.state.addDataModel.age}
              placeholder="Enter Age here"
              textContentType="telephoneNumber"
            />
            {/* <Button
              title="Click to Add Document"
              color="purple"
              onPress={this.addDocument}
            /> */}
            <View alignItems="center">
              <TouchableOpacity
                onPress={next => {
                  this.addDocument();
                  //next();
                }}>
                <View style={styles.buttonStyle}>
                  <Text style={styles.textStyle}>Click to Add Document</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'remove':
        return (
          <View style={{flex: 1, width: '100%', padding: 10}}>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginVertical: 5,
              }}
              onChangeText={text =>
                this.setState({removeDataModel: {id: text}})
              }
              value={this.state.removeDataModel.id}
              placeholder="Enter Document id here"
              textContentType="telephoneNumber"
            />
            {/* <Button
              title="Click to Delete Document"
              color="purple"
              onPress={this.removeDocument}
            /> */}

            <View alignItems="center">
              <TouchableOpacity
                onPress={next => {
                  this.removeDocument();
                  //next();
                }}>
                <View style={styles.buttonStyle}>
                  <Text style={styles.textStyle}>Click to Delete Document</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'find':
        return (
          <View style={{flex: 1, width: '100%', padding: 10}}>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={text =>
                this.setState({findQueryModel: {query: text}})
              }
              value={this.state.findQueryModel.query}
              placeholder="Enter query here"
            />
            <View
              style={{
                height: 50,
                flexDirection: 'row',
                alignContent: 'center',
              }}>
              <View style={{margin: 5, width: '30%'}}>
                <Button
                  color={colors.jsonstoreOption}
                  title="by ID"
                  onPress={this.findDocumentById}
                />
              </View>

              <View style={{margin: 5, width: '31%'}}>
                <Button
                  color={colors.jsonstoreOption}
                  title="by Name"
                  onPress={this.findDocumentsByName}
                />
              </View>

              <View style={{margin: 5, width: '31%'}}>
                <Button
                  color={colors.jsonstoreOption}
                  title="by Age"
                  onPress={this.findDocumentsByAge}
                />
              </View>
            </View>

            <View alignItems="center" style={{margin: 5}}>
              {/* <Button
                title="Find All Documents"
                color="purple"
                onPress={this.findDocuments}
              /> */}

              <TouchableOpacity
                onPress={next => {
                  this.findDocuments();
                  //next();
                }}>
                <View style={styles.buttonStyle}>
                  <Text style={styles.textStyle}>Find All Documents</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'count':
        return (
          <View style={{flex: 1, width: '100%', padding: 10}}>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              onChangeText={text =>
                this.setState({countQueryModel: {query: text}})
              }
              value={this.state.countQueryModel.query}
              placeholder="Enter query here"
            />
            <View
              style={{
                height: 50,
                flexDirection: 'row',
                alignContent: 'center',
              }}>
              <View style={{margin: 5, width: '48%'}}>
                <Button
                  color={colors.jsonstoreOption}
                  title="by Name"
                  onPress={this.countDocumentsByName}
                />
              </View>

              <View style={{margin: 5, width: '48%'}}>
                <Button
                  color={colors.jsonstoreOption}
                  title="by Age"
                  onPress={this.countDocumentsByAge}
                />
              </View>
            </View>
            <View alignItems="center" style={{margin: 5}}>
              {/* <Button
                title="get total Documents count"
                color="purple"
                onPress={this.countDocuments}
              /> */}

              <TouchableOpacity
                onPress={next => {
                  this.countDocuments();
                  //next();
                }}>
                <View style={styles.buttonStyle}>
                  <Text style={styles.textStyle}>
                    Get total Documents count
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'clearCollection':
        return (
          <View
            style={{
              flex: 1,
              width: '100%',
              padding: 10,
              alignItems: 'center',
            }}>
            {/* <Button
              title="Click to Clear Collection"
              color="red"
              onPress={this.clearCollection}
            /> */}

            <TouchableOpacity
              onPress={next => {
                this.clearCollection();
                //next();
              }}>
              <View style={styles.buttonStyle}>
                <Text style={styles.textStyle}>Click to Clear Collection</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'removeCollection':
        return (
          <View
            style={{
              flex: 1,
              width: '100%',
              padding: 10,
              alignItems: 'center',
            }}>
            {/* <Button
              title="Click to Remove Collection"
              color="red"
              onPress={this.removeCollection}
            /> */}
            <TouchableOpacity
              onPress={next => {
                this.removeCollection();
                //next();
              }}>
              <View style={styles.buttonStyle}>
                <Text style={styles.textStyle}>Click to Remove Collection</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
    }
  }

  render() {
    return (
      <View style={(styles.container, styles.screenbg)}>
        <View style={styles.testItemsContainer}>
          {this.returnPickerView()}
          {this.returnOperationDetailView()}
        </View>
        <View style={styles.testResultsContainer}>
          <Text
            style={{
              color: 'black',
              fontSize: 20,
              textAlign: 'center',
              marginVertical: 5,
            }}>
            RESULTS
          </Text>
          <ScrollView>
          <Text style={{color: 'black', fontSize: 16, margin: 10}}>
            {this.state.result}
          </Text>
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: '#e1f5e6',
  },
  testItemsContainer: {
    height: '60%',
    width: '100%',
  },
  testResultsContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: '#ddd',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 30,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  buttonStyle: {
    width: '100%',
  },
  buttonContainer: {
    margin: 5,
  },
  button: {
    marginBottom: 10,
    fontWeight: '500',
  },
  charan: {
    alignItems: 'center',
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: colors.buttonColor,
    padding: 10,
    margin: 10,
    borderRadius: 5,
    color: colors.textColor,
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
  },
  textStyle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  screenbg: {
    backgroundColor: '#fff',
    flex: 1,
  },
});


export default App;
