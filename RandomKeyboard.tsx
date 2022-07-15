import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, Platform, Image, Dimensions } from 'react-native';
import cloneDeep from 'lodash/cloneDeep';
import { scale } from 'react-native-size-matters';

const statusBarHeight = 10; //임시
const hasNotchDevice = true; //임시
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;
const screenHeight = Dimensions.get('screen').height;
const HeaderHeight = scale(59);

const KEYBOARD_HEIGHT = 250;

const keyMapSyllable = {
  q: 'ㅂ',
  w: 'ㅈ',
  e: 'ㄷ',
  r: 'ㄱ',
  t: 'ㅅ',
  y: 'ㅛ',
  u: 'ㅕ',
  i: 'ㅑ',
  o: 'ㅐ',
  p: 'ㅔ',
  a: 'ㅁ',
  s: 'ㄴ',
  d: 'ㅇ',
  f: 'ㄹ',
  g: 'ㅎ',
  h: 'ㅗ',
  j: 'ㅓ',
  k: 'ㅏ',
  l: 'ㅣ',
  z: 'ㅋ',
  x: 'ㅌ',
  c: 'ㅊ',
  v: 'ㅍ',
  b: 'ㅠ',
  n: 'ㅜ',
  m: 'ㅡ',
};

const keyboardArray = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '<-'],
  ['재배열', '특수', 'space', '초기화', '입력완료'],
];
const initSpecialKeyboardArray = [
  ['.', '!', '@', '#', '$', '%', '^', '&', '*', '('],
  [')', '`', '-', '=', '₩', '[', ']', ';', "'", ','],
  ['.', '/', '~', '_', '+', '|', '{', '}', ':'], //2개추가
  ['"', '<', '>', '?', '<-'], //3개추가
  ['재배열', '영문', 'space', '초기화', '입력완료'],
];

const randomNumber = (min: number, max: number) => {
  if (max > min) {
    var rand = min + Math.random() * (max - min);
    return rand;
  } else {
    return 0;
  }
};
/**
 * 영문키보드 배열을 섞어줌
 */
const getRandomKeyboard = (beforeKeyboard: (number | string)[][]) => {
  const randomKeyboardArray = cloneDeep(beforeKeyboard);

  randomKeyboardArray.map((keysArray, index) => {
    if (index < randomKeyboardArray.length - 3) {
      keysArray.splice(randomNumber(0, keysArray.length + 1), 0, ' ');
      return keysArray;
    } else if (index < randomKeyboardArray.length - 2) {
      keysArray.splice(randomNumber(0, keysArray.length), 0, ' ');
      keysArray.splice(randomNumber(0, keysArray.length), 0, ' ');
      return keysArray;
    } else if (index < randomKeyboardArray.length - 1) {
      keysArray.splice(randomNumber(1, keysArray.length), 0, ' ');
    } else {
      return keysArray;
    }
  });
  return randomKeyboardArray;
};
/**
 * 특수문자 키보드 랜덤배열 얻기
 */
const getSpecialRandomKeyboard = (beforeKeyboard: (string | number)[][]) => {
  const specialKeyboardArray = cloneDeep(beforeKeyboard);

  specialKeyboardArray.map((keysArray, index) => {
    if (index < specialKeyboardArray.length - 3) {
      return keysArray.splice(randomNumber(0, keysArray.length + 1), 0, ' ');
    } else if (index < specialKeyboardArray.length - 2) {
      keysArray.splice(randomNumber(0, keysArray.length + 1), 0, ' ');
      keysArray.splice(randomNumber(0, keysArray.length + 1), 0, ' ');
      return keysArray;
    } else if (index < specialKeyboardArray.length - 1) {
      keysArray.splice(randomNumber(0, keysArray.length), 0, ' ');
      keysArray.splice(randomNumber(0, keysArray.length), 0, ' ');
      keysArray.splice(randomNumber(0, keysArray.length), 0, ' ');
      keysArray.splice(randomNumber(0, keysArray.length), 0, ' ');
      keysArray.splice(randomNumber(0, keysArray.length), 0, ' ');
      return keysArray;
    } else {
      return keysArray;
    }
  });
  return specialKeyboardArray;
};

//////

const RandomKeyboard = (props) => {
  const keyboard_y = useRef(new Animated.Value(deviceHeight));
  const [randomKeyboardArray, setRandomKeyboardArray] = useState<(number | string)[][]>(
    getRandomKeyboard(keyboardArray),
  ); //섞인 키보드 배열
  const [specialKeyboardArray, setSpecialKeyboardArray] = useState(getSpecialRandomKeyboard(initSpecialKeyboardArray)); //섞인 특수문자 키보드 배열
  const [shiftFlag, setShiftFlag] = useState(false);
  const [specialChar, setSpecialChar] = useState(false); //true면 특수문자
  const longPress = useRef(false);
  const text = useRef<string>(props.value ? props.value : '');

  const deleteText = () => {
    if (text.current && text.current.length > 0) {
      // 잘 지워지면 true, 안지워졌으면 false
      text.current = text.current.substr(0, text.current.length - 1);
      props.onChangeText && props.onChangeText(text.current);
      return true;
    } else {
      return false;
    }
  };

  const deleteTextLongPress = (timeout = 100) => {
    if (longPress.current) {
      if (deleteText()) {
        setTimeout(() => {
          deleteTextLongPress(timeout > 15 ? timeout - 15 : 0);
        }, timeout);
      } else {
        longPress.current = false;
      }
    }
  };

  const clearText = () => {
    text.current = '';
    props.onChangeText && props.onChangeText('');
  };

  /**
   * keyEvent
   */
  const keyEvent = (idx: number, idx2: number, inputLongPress = false) => () => {
    const keyValue = specialChar ? specialKeyboardArray[idx][idx2] : randomKeyboardArray[idx][idx2];
    switch (keyValue) {
      case '<-':
        if (inputLongPress) {
          longPress.current = inputLongPress;
          deleteTextLongPress();
        } else {
          deleteText();
        }
        break;

      case 'space':
        text.current = text.current.concat(' ');
        props.onChangeText && props.onChangeText(text.current);
        break;

      case 'shift':
      case 'SHIFT':
        if (specialChar) {
          break;
        }

        if (!shiftFlag) {
          setRandomKeyboardArray(
            randomKeyboardArray.map((data) => {
              return data.map((key) => {
                if ((typeof key === 'string' && key.length === 1) || key === 'shift') {
                  return key.toUpperCase();
                } else {
                  return key;
                }
              });
            }),
          );
          setShiftFlag(!shiftFlag);
        } else {
          setRandomKeyboardArray(
            randomKeyboardArray.map((data) => {
              return data.map((key) => {
                if ((typeof key === 'string' && key.length === 1) || key === 'SHIFT') {
                  return key.toLowerCase();
                } else {
                  return key;
                }
              });
            }),
          );
          setShiftFlag(!shiftFlag);
        }
        break;

      case '입력완료':
        props.onConfirm && props.onConfirm(text);
        break;

      case '특수':
        !specialChar && setSpecialChar(true);
        break;
      case '영문':
        specialChar && setSpecialChar(false);
        break;
      case ' ':
        break;
      case '재배열':
        if (specialChar) {
          setSpecialKeyboardArray(getSpecialRandomKeyboard(initSpecialKeyboardArray));
        } else {
          setRandomKeyboardArray(getRandomKeyboard(keyboardArray));
        }
        break;
      case '초기화':
        clearText();
        break;
      default:
        text.current = text.current.concat(keyValue);
        props.onChangeText && props.onChangeText(text.current);
    }

    return randomKeyboardArray[idx][idx2];
  };

  const makeKeyboard = () => {
    const getBackgroundColor = (idx: number, idx2: number) => {
      if (
        (idx === 3 && ((idx2 === 0 && !specialChar) || idx2 === 9)) ||
        (idx === 4 && (idx2 === 0 || idx2 === 1 || idx2 === 2))
      ) {
        return { backgroundColor: '#d1d1d1' };
      } else if (idx === 4 && (idx2 === 3 || idx2 === 4)) {
        return { backgroundColor: '#00bae8' };
      } else {
        return { backgroundColor: 'white' };
      }
    };
    const getTextColor = (idx: number, idx2: number) => {
      if (idx === 3 && (idx2 === 0 || idx2 === 9)) {
        return { color: '#919191' };
      } else if (idx === 4 && (idx2 === 3 || idx2 === 4)) {
        return { color: 'white', fontSize: 17 };
      } else if (idx === 4 && (idx2 === 0 || idx2 === 1 || idx2 === 2)) {
        return { color: '#919191', fontSize: 17 };
      } else if (idx === 0 && !specialChar) {
        return { color: '#585858', fontSize: 26 };
      } else {
        return { color: '#585858', fontSize: 20 };
      }
    };

    if (props.isShow) {
      focus();
    } else {
      blur();
    }
    if (specialChar) {
      return specialKeyboardArray.map((data, idx) => {
        return (
          <View
            style={{
              width: '100%',
              height: KEYBOARD_HEIGHT / 5,
              flexDirection: 'row',
            }}
            key={idx}
          >
            {data.map((key, idx2) => {
              if (key === ' ') {
                return (
                  <View
                    style={[styles.keyboardKeyStyle, { flex: deviceWidth / 11, borderColor: 'transparent' }]}
                    key={idx2 + (idx + 1) * 100}
                  >
                    <Text style={{ color: 'gray' }} />
                  </View>
                );
              } else {
                if (key === '<-') {
                  return (
                    <TouchableOpacity
                      style={[
                        styles.keyboardKeyStyle,
                        { flex: (deviceWidth / 11) * 2 + 4 },
                        getBackgroundColor(idx, idx2),
                      ]}
                      key={idx2 + (idx + 1) * 100}
                      onPress={keyEvent(idx, idx2)}
                      onPressOut={(data) => (longPress.current = false)}
                      onLongPress={keyEvent(idx, idx2, true)}
                      activeOpacity={0.6}
                    >
                      {/* <Image source={R.icon_cert_delate} resizeMode="contain" /> */}
                      <Text>{'<-'}</Text>
                    </TouchableOpacity>
                  );
                } else if (idx == 4) {
                  if (idx2 == 4) {
                    return (
                      <TouchableOpacity
                        style={[
                          styles.keyboardKeyStyle,
                          { flex: (deviceWidth / 11) * 3 + 3 },
                          getBackgroundColor(idx, idx2),
                        ]}
                        key={idx2 + (idx + 1) * 100}
                        onPress={keyEvent(idx, idx2)}
                        onPressOut={(data) => (longPress.current = false)}
                        onLongPress={keyEvent(idx, idx2, true)}
                        activeOpacity={0.6}
                      >
                        <Text style={getTextColor(idx, idx2)}>{key}</Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        style={[
                          styles.keyboardKeyStyle,
                          { flex: (deviceWidth / 11) * 2 },
                          getBackgroundColor(idx, idx2),
                        ]}
                        key={idx2 + (idx + 1) * 100}
                        onPress={keyEvent(idx, idx2)}
                        onPressOut={(data) => (longPress.current = false)}
                        onLongPress={keyEvent(idx, idx2, true)}
                        activeOpacity={0.6}
                      >
                        <Text style={getTextColor(idx, idx2)}>{key}</Text>
                      </TouchableOpacity>
                    );
                  }
                } else {
                  return (
                    <TouchableOpacity
                      style={[
                        styles.keyboardKeyStyle,
                        { flex: deviceWidth / 11, backgroundColor: 'white' },
                        getBackgroundColor(idx, idx2),
                      ]}
                      key={idx2 + (idx + 1) * 100}
                      onPress={keyEvent(idx, idx2)}
                      onPressOut={(data) => (longPress.current = false)}
                      onLongPress={keyEvent(idx, idx2, true)}
                      activeOpacity={0.6}
                    >
                      <Text style={getTextColor(idx, idx2)}>{key}</Text>
                    </TouchableOpacity>
                  );
                }
              }
            })}
          </View>
        );
      });
    } else {
      return randomKeyboardArray.map((data, idx) => {
        return (
          <View
            style={{
              width: '100%',
              height: KEYBOARD_HEIGHT / 5,
              flexDirection: 'row',
            }}
            key={idx}
          >
            {data.map((key, idx2) => {
              if (key === ' ') {
                return (
                  <View
                    style={[styles.keyboardKeyStyle, { flex: deviceWidth / 11, borderColor: 'transparent' }]}
                    key={idx2 + (idx + 1) * 100}
                  >
                    <Text style={{ color: 'gray' }} />
                  </View>
                );
              } else {
                if (key == '<-') {
                  return (
                    <TouchableOpacity
                      style={[
                        styles.keyboardKeyStyle,
                        { flex: (deviceWidth / 11) * 2 + 4 },
                        getBackgroundColor(idx, idx2),
                      ]}
                      key={idx2 + (idx + 1) * 100}
                      onPress={keyEvent(idx, idx2)}
                      onPressOut={(data) => (longPress.current = false)}
                      onLongPress={keyEvent(idx, idx2, true)}
                      activeOpacity={0.6}
                    >
                      <Text>delete</Text>
                      {/* <Image source={R.icon_cert_delate} resizeMode="contain" />> */}
                    </TouchableOpacity>
                  );
                } else if (idx == 4) {
                  if (idx2 == 4) {
                    //입력완료
                    return (
                      <TouchableOpacity
                        style={[
                          styles.keyboardKeyStyle,
                          { flex: (deviceWidth / 11) * 3 + 3 },
                          getBackgroundColor(idx, idx2),
                        ]}
                        key={idx2 + (idx + 1) * 100}
                        onPress={keyEvent(idx, idx2)}
                        onPressOut={(data) => (longPress.current = false)}
                        onLongPress={keyEvent(idx, idx2, true)}
                        activeOpacity={1}
                      >
                        <Text style={getTextColor(idx, idx2)}>{key}</Text>
                      </TouchableOpacity>
                    );
                  } else {
                    return (
                      <TouchableOpacity
                        style={[
                          styles.keyboardKeyStyle,
                          { flex: (deviceWidth / 11) * 2 },
                          getBackgroundColor(idx, idx2),
                        ]}
                        key={idx2 + (idx + 1) * 100}
                        onPress={keyEvent(idx, idx2)}
                        onPressOut={(data) => (longPress.current = false)}
                        onLongPress={keyEvent(idx, idx2, true)}
                        activeOpacity={1}
                      >
                        <Text style={getTextColor(idx, idx2)}>{key}</Text>
                      </TouchableOpacity>
                    );
                  }
                } else {
                  return (
                    <TouchableOpacity
                      style={[styles.keyboardKeyStyle, { flex: deviceWidth / 11 }, getBackgroundColor(idx, idx2)]}
                      key={idx2 + (idx + 1) * 100}
                      onPress={keyEvent(idx, idx2)}
                      onPressOut={(data) => (longPress.current = false)}
                      onLongPress={keyEvent(idx, idx2, true)}
                      activeOpacity={0.6}
                    >
                      {typeof key === 'string' && key.toLowerCase() === 'shift' ? (
                        // <Image style={getBackgroundColor(idx, idx2)} source={R.icon_cert_shift} resizeMode="contain" />
                        <Text>shift</Text>
                      ) : (
                        <Text style={getTextColor(idx, idx2)}>{key}</Text>
                      )}
                      {typeof key === 'string' && keyMapSyllable[key.toLowerCase()] && (
                        <Text style={{ color: '#a0a0a0', fontSize: 14 }}>{keyMapSyllable[key.toLowerCase()]}</Text>
                      )}
                    </TouchableOpacity>
                  );
                }
              }
            })}
          </View>
        );
      });
    }
  };

  const focus = () => {
    Animated.timing(keyboard_y.current, {
      toValue: hasNotchDevice
        ? deviceHeight - KEYBOARD_HEIGHT - HeaderHeight - 150
        : deviceHeight -
          (Platform.select({ ios: 10, android: deviceHeight === screenHeight ? statusBarHeight : 0 }) ?? 0) -
          KEYBOARD_HEIGHT -
          HeaderHeight, //
      duration: 500,
      delay: 0,
      useNativeDriver: true,
    }).start();
  };
  const blur = () => {
    //blur
    Animated.timing(keyboard_y.current, {
      toValue: deviceHeight,
      duration: 200,
      delay: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: '100%',
          height: hasNotchDevice ? KEYBOARD_HEIGHT + 60 : KEYBOARD_HEIGHT,
          backgroundColor: '#e8e8e8',
          transform: [{ translateY: keyboard_y.current }],
          top: 0,
        }}
      >
        {makeKeyboard()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardKeyStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 1,
    marginRight: 1,
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default RandomKeyboard;
