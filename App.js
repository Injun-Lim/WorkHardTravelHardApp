import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./color";
import React, { useEffect, useState } from "react";
import { Fontisto, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Checkbox from "expo-checkbox";

const STORAGE_KEY = "@toDos";
const IS_WORK = "@isWork";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [tmpText, setTmpText] = useState("");

  const travel = async () => {
    setWorking(false);

    await AsyncStorage.setItem(IS_WORK, "false");
  };
  const work = async () => {
    setWorking(true);

    await AsyncStorage.setItem(IS_WORK, "true");
  };
  const onChangeText = (event) => setText(event);

  const saveToDos = async (toSave) => {
    const s = JSON.stringify(toSave);

    await AsyncStorage.setItem(STORAGE_KEY, s);
  };

  const loadToDos = async (toSave) => {
    try {
      const toDoString = await AsyncStorage.getItem(STORAGE_KEY);
      const isWorkString = await AsyncStorage.getItem(IS_WORK);

      setToDos(JSON.parse(toDoString));
      setWorking(JSON.parse(isWorkString));
    } catch (e) {
      setToDos("");
      setWorking("");
    }
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });

    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, isChecked: false, isEditing: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  useEffect(() => {
    loadToDos();
  }, []);

  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "OK",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };

  const editToDo = async (key) => {
    const newToDos = { ...toDos };
    console.log(newToDos[key].isEditing + " to " + !newToDos[key].isEditing);
    if (toDos[key].isEditing) {
      newToDos[key].text = tmpText;
      newToDos[key].isEditing = false;
    } else {
      newToDos[key].isEditing = true;
      setTmpText(newToDos[key].text);
    }
    setToDos(newToDos);
    await saveToDos(newToDos);
  };

  const fnCheckbox = async (key) => {
    const toggleCheck = { ...toDos };
    toggleCheck[key].isChecked = !toggleCheck[key].isChecked;

    setToDos(toggleCheck);
    await saveToDos(toggleCheck);
  };

  const onEditToDo = async (text) => {
    setTmpText(text);
  };

  const onEndEditToDo = async (key) => {
    if (toDos[key].isEditing) {
      const newToDos = { ...toDos };

      setTmpText("");

      setToDos(newToDos);
      await saveToDos(newToDos);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        returnKeyType="done"
        autoCapitalize={"sentences"}
        onChangeText={onChangeText}
        value={text}
        style={styles.input}
        placeholder={working ? "Add a To-Do" : "Where do you want to go?"}
      />

      <ScrollView>
        {Object.keys(toDos).length > 0
          ? Object.keys(toDos).map((key) =>
              toDos[key].working === working ? (
                <View
                  style={toDos[key].isChecked ? styles.toDoChk : styles.toDo}
                  key={key}
                >
                  <View style={styles.chkTxt}>
                    <Checkbox
                      style={styles.checkbox}
                      value={toDos[key].isChecked}
                      onValueChange={() => fnCheckbox(key)}
                    />
                    <TextInput
                      style={
                        toDos[key].isChecked
                          ? styles.toDoTextDone
                          : styles.toDoText
                      }
                      editable={toDos[key].isEditing}
                      value={!toDos[key].isEditing ? toDos[key].text : tmpText}
                      autoFocus={toDos[key].isEditing}
                      onChangeText={onEditToDo}
                      // onEndEditing={onEndEditToDo(key)}
                      // onSubmitEditing={onEndEditToDo(key)}
                    />
                  </View>

                  <View style={styles.buttons}>
                    <TouchableOpacity onPress={() => editToDo(key)}>
                      {toDos[key].isEditing ? (
                        <MaterialIcons
                          name="done"
                          size={18}
                          color={theme.done}
                          style={styles.btnEach}
                        />
                      ) : (
                        <MaterialIcons
                          name="edit"
                          size={18}
                          color={theme.edit}
                          style={styles.btnEach}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteToDo(key)}>
                      <Fontisto
                        name="trash"
                        size={18}
                        color={theme.del}
                        style={styles.btnEach}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            )
          : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 44,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoChk: {
    backgroundColor: theme.toDoChkBg,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "500",
  },
  toDoTextDone: {
    color: "white",
    fontSize: 20,
    fontWeight: "500",
    textDecorationLine: "line-through",
  },
  chkTxt: {
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  checkbox: {
    margin: 8,
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
  },
  btnEach: {
    marginHorizontal: 5,
  },
});
