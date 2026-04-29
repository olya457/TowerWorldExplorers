import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  Region,
} from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterChips from '../../shared/components/FilterChips';
import { structureCategories, structures } from '../../domain/structures/structures';
import { useLandmarkProgress } from '../../domain/structures/useLandmarkProgress';
import { Structure } from '../../domain/models';
import { RootStackParamList } from '../../core/navigation/types';
import { colors } from '../../shared/theme/colors';
import { usePersistentAndroidInsets } from '../../shared/hooks/usePersistentInsets';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type MapPoint = {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  image: any;
  height: number;
  floors?: number;
  year: number;
  description: string;
  raw: Structure;
};

const FALLBACK_REGION: Region = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 35,
  longitudeDelta: 35,
};

const WorldMapScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const androidInsets = usePersistentAndroidInsets();
  const progress = useLandmarkProgress();

  const mapRef = useRef<MapView | null>(null);
  const regionRef = useRef<Region>(FALLBACK_REGION);
  const mapReadyRef = useRef(false);
  const layoutReadyRef = useRef(false);
  const didInitialFitRef = useRef(false);

  const [selected, setSelected] = useState<Structure | null>(null);
  const [androidMapKey, setAndroidMapKey] = useState(0);
  const [category, setCategory] = useState<string>('All');

  const topOffset = Platform.OS === 'android' ? androidInsets.top : insets.top;

  const validStructures = useMemo<MapPoint[]>(() => {
    return structures
      .filter(item => category === 'All' || item.category === category)
      .map(item => {
        const latitude = Number((item as any).latitude);
        const longitude = Number((item as any).longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return {
          id: String(item.id),
          name: item.name,
          location: item.location,
          latitude,
          longitude,
          image: item.image,
          height: item.height,
          floors: item.floors,
          year: item.year,
          description: item.description,
          raw: item,
        };
      })
      .filter(Boolean) as MapPoint[];
  }, [category]);

  const initialRegion = useMemo<Region>(() => {
    if (validStructures.length === 0) {
      return FALLBACK_REGION;
    }

    if (validStructures.length === 1) {
      return {
        latitude: validStructures[0].latitude,
        longitude: validStructures[0].longitude,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
      };
    }

    const minLat = Math.min(...validStructures.map(item => item.latitude));
    const maxLat = Math.max(...validStructures.map(item => item.latitude));
    const minLng = Math.min(...validStructures.map(item => item.longitude));
    const maxLng = Math.max(...validStructures.map(item => item.longitude));

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat + 25, 20),
      longitudeDelta: Math.max(maxLng - minLng + 25, 20),
    };
  }, [validStructures]);

  const onRegionChangeComplete = (region: Region) => {
    regionRef.current = region;
  };

  const fitAll = useCallback((animated = true) => {
    if (!mapRef.current || validStructures.length === 0) {
      return;
    }

    if (validStructures.length === 1) {
      const only = validStructures[0];

      const nextRegion: Region = {
        latitude: only.latitude,
        longitude: only.longitude,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
      };

      regionRef.current = nextRegion;
      mapRef.current.animateToRegion(nextRegion, animated ? 500 : 0);
      return;
    }

    mapRef.current.fitToCoordinates(
      validStructures.map(item => ({
        latitude: item.latitude,
        longitude: item.longitude,
      })),
      {
        edgePadding:
          Platform.OS === 'android'
            ? { top: 180, right: 100, bottom: 260, left: 100 }
            : { top: 140, right: 80, bottom: 220, left: 80 },
        animated,
      },
    );
  }, [validStructures]);

  const tryInitialFit = () => {
    if (didInitialFitRef.current) {
      return;
    }

    if (!mapReadyRef.current || !layoutReadyRef.current) {
      return;
    }

    didInitialFitRef.current = true;

    if (Platform.OS === 'android') {
      setTimeout(() => {
        mapRef.current?.animateToRegion(initialRegion, 0);
      }, 300);

      setTimeout(() => {
        fitAll(false);
      }, 1200);

      return;
    }

    setTimeout(() => {
      fitAll(true);
    }, 300);
  };

  const onMapReady = () => {
    mapReadyRef.current = true;
    tryInitialFit();
  };

  const onMapLayout = () => {
    layoutReadyRef.current = true;
    tryInitialFit();
  };

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'android') {
        return;
      }

      const timer = setTimeout(() => {
        fitAll(false);
      }, 700);

      return () => clearTimeout(timer);
    }, [fitAll]),
  );

  const share = async () => {
    if (!selected) {
      return;
    }

    try {
      await Share.share({
        message: `${selected.name} — ${selected.location}. Height: ${selected.height}m. Built in ${selected.year}.`,
      });
    } catch {}
  };

  const goDetails = () => {
    if (!selected) {
      return;
    }

    const id = selected.id;
    setSelected(null);
    progress.markVisited(id);
    navigation.navigate('LandmarkProfile', { structureId: id });
  };

  const zoomIn = () => {
    const r = regionRef.current;

    const nextRegion: Region = {
      latitude: r.latitude,
      longitude: r.longitude,
      latitudeDelta: Math.max(r.latitudeDelta / 2, 0.005),
      longitudeDelta: Math.max(r.longitudeDelta / 2, 0.005),
    };

    regionRef.current = nextRegion;
    mapRef.current?.animateToRegion(nextRegion, 300);
  };

  const zoomOut = () => {
    const r = regionRef.current;

    const nextRegion: Region = {
      latitude: r.latitude,
      longitude: r.longitude,
      latitudeDelta: Math.min(r.latitudeDelta * 2, 180),
      longitudeDelta: Math.min(r.longitudeDelta * 2, 180),
    };

    regionRef.current = nextRegion;
    mapRef.current?.animateToRegion(nextRegion, 300);
  };

  const resetView = () => {
    didInitialFitRef.current = false;
    mapReadyRef.current = false;
    layoutReadyRef.current = false;
    regionRef.current = initialRegion;

    if (Platform.OS === 'android') {
      setAndroidMapKey(prev => prev + 1);
      return;
    }

    mapRef.current?.animateToRegion(initialRegion, 400);

    setTimeout(() => {
      fitAll(true);
      didInitialFitRef.current = true;
    }, 250);
  };

  return (
    <View style={styles.root}>
      <MapView
        key={Platform.OS === 'android' ? `android-map-${androidMapKey}` : 'ios-map'}
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        moveOnMarkerPress={false}
        toolbarEnabled={false}
        loadingEnabled
        loadingIndicatorColor={colors.text}
        loadingBackgroundColor={colors.background}
        showsCompass={false}
        showsScale={false}
        rotateEnabled
        scrollEnabled
        zoomEnabled
        pitchEnabled={false}
        onMapReady={onMapReady}
        onLayout={onMapLayout}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {validStructures.map(item => {
          const markerColor = progress.bookmarkedSet.has(item.id)
            ? colors.yellow
            : progress.visitedSet.has(item.id)
              ? colors.green
              : colors.accent;

          return (
            <Marker
              key={item.id}
              identifier={item.id}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              title={item.name}
              description={item.location}
              pinColor={markerColor}
              tracksViewChanges={false}
              onPress={() => setSelected(item.raw)}
            />
          );
        })}
      </MapView>

      <View style={[styles.topBar, { paddingTop: topOffset }]} pointerEvents="box-none">
        <View style={styles.titleBox}>
          <Text style={styles.title}>World Map</Text>
          <Text style={styles.subtitle}>
            {validStructures.length} mapped landmarks in this view
          </Text>
        </View>
        <View style={styles.mapFilter}>
          <FilterChips items={structureCategories} active={category} onChange={setCategory} />
        </View>
      </View>

      <View style={styles.controls} pointerEvents="box-none">
        <TouchableOpacity activeOpacity={0.8} onPress={zoomIn} style={styles.ctrlBtn}>
          <Text style={styles.ctrlText}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={zoomOut} style={styles.ctrlBtn}>
          <Text style={styles.ctrlText}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => fitAll(true)} style={styles.ctrlBtn}>
          <Text style={styles.ctrlIconSmall}>⤢</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={resetView} style={styles.ctrlBtn}>
          <Text style={styles.ctrlIconSmall}>🌍</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.cardWrap} onPress={() => {}}>
            {selected ? (
              <View style={styles.card}>
                <Image source={selected.image} style={styles.cardImage} resizeMode="cover" />

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelected(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>{selected.name}</Text>
                  <Text style={styles.cardLocation}>{selected.location}</Text>

                  <Text style={styles.cardMeta}>
                    {selected.height}m
                    {selected.floors ? `  •  ${selected.floors} floors` : ''}
                    {`  •  ${selected.year}`}
                  </Text>
                  <Text style={styles.statusText}>
                    {progress.bookmarkedSet.has(selected.id) ? 'Saved' : 'Not saved'}
                    {'  •  '}
                    {progress.visitedSet.has(selected.id) ? 'Visited' : 'Not visited'}
                  </Text>

                  <Text style={styles.cardDesc} numberOfLines={4}>
                    {selected.description}
                  </Text>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={goDetails}
                      style={styles.primaryBtn}
                    >
                      <Text style={styles.primaryBtnText}>Open details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={share}
                      style={styles.secondaryBtn}
                    >
                      <Text style={styles.secondaryBtnText}>➤</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  titleBox: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: 'rgba(11,23,51,0.85)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  mapFilter: {
    marginTop: 2,
  },
  controls: {
    position: 'absolute',
    right: 14,
    top: '35%',
    alignItems: 'center',
  },
  ctrlBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(11,23,51,0.9)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctrlText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  ctrlIconSmall: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 22,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cardWrap: {
    width: '100%',
    maxWidth: 380,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  cardBody: {
    padding: 18,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  cardLocation: {
    color: colors.yellow,
    fontWeight: '700',
    marginTop: 2,
  },
  cardMeta: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 12,
  },
  statusText: {
    color: colors.yellow,
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  cardDesc: {
    color: colors.textMuted,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  primaryBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  primaryBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WorldMapScreen;
