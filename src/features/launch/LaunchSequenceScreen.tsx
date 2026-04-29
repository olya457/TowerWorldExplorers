import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BackgroundWrapper from '../../shared/components/BackgroundWrapper';
import { RootStackParamList } from '../../core/navigation/types';
import { readJson } from '../../shared/storage/jsonStorage';
import { storageKeys } from '../../shared/storage/keys';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LaunchSequence'>;

const loaderHtml = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 100%;
    height: 100%;
    background: transparent;
    overflow: hidden;
  }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stage {
    position: relative;
    width: 260px;
    height: 260px;
  }
  .glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 220px;
    height: 220px;
    margin-left: -110px;
    margin-top: -110px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168,85,247,0.45), rgba(59,130,246,0.15) 55%, transparent 70%);
    filter: blur(6px);
    animation: pulse 2.4s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { transform: scale(0.9); opacity: 0.75; }
    50%      { transform: scale(1.05); opacity: 1; }
  }
  .pyramid {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 160px;
    height: 160px;
    margin-left: -80px;
    margin-top: -80px;
    transform-style: preserve-3d;
    animation: spin 6s linear infinite;
  }
  @keyframes spin {
    from { transform: rotateX(-18deg) rotateY(0deg); }
    to   { transform: rotateX(-18deg) rotateY(360deg); }
  }
  .face {
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 0;
    height: 0;
    margin-left: -80px;
    border-left: 80px solid transparent;
    border-right: 80px solid transparent;
    border-bottom: 140px solid;
    opacity: 0.9;
  }
  .f1 { border-bottom-color: #ec4899; transform: rotateY(0deg) translateZ(46px); }
  .f2 { border-bottom-color: #a855f7; transform: rotateY(90deg) translateZ(46px); }
  .f3 { border-bottom-color: #3b82f6; transform: rotateY(180deg) translateZ(46px); }
  .f4 { border-bottom-color: #10b981; transform: rotateY(-90deg) translateZ(46px); }
</style>
</head>
<body>
  <div class="stage">
    <div class="glow"></div>
    <div class="pyramid">
      <div class="face f1"></div>
      <div class="face f2"></div>
      <div class="face f3"></div>
      <div class="face f4"></div>
    </div>
  </div>
</body>
</html>
`;

const LaunchSequenceScreen = () => {
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      const completed = await readJson(storageKeys.onboardingCompleted, false);
      if (!mounted) {
        return;
      }
      navigation.reset({
        index: 0,
        routes: [{ name: completed ? 'ExplorationTabs' : 'WelcomeJourney' }],
      });
    }, 2200);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <View style={styles.webviewBox}>
          <WebView
            originWhitelist={['*']}
            source={{ html: loaderHtml }}
            style={styles.webview}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            androidLayerType="hardware"
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webviewBox: {
    width: 280,
    height: 280,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default LaunchSequenceScreen;
