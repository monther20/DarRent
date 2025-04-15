import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { Platform } from 'react-native/Libraries/Utilities/Platform';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText style={{ fontSize: 24, fontWeight: 'bold' }} children="Explore" />
      </ThemedView>
      <ThemedText children="This app includes example code to help you get started." />
      <Collapsible title="File-based routing">
        <ThemedText children={
          <>
            This app has two screens:{' '}
            <ThemedText style={{ fontWeight: '600' }} children="app/(tabs)/index.tsx" /> and{' '}
            <ThemedText style={{ fontWeight: '600' }} children="app/(tabs)/explore.tsx" />
          </>
        } />
        <ThemedText children={
          <>
            The layout file in <ThemedText style={{ fontWeight: '600' }} children="app/(tabs)/_layout.tsx" />{' '}
            sets up the tab navigator.
          </>
        } />
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText style={{ color: '#0066cc' }} children="Learn more" />
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText children={
          <>
            You can open this project on Android, iOS, and the web. To open the web version, press{' '}
            <ThemedText style={{ fontWeight: '600' }} children="w" /> in the terminal running this project.
          </>
        } />
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText children={
          <>
            For static images, you can use the <ThemedText style={{ fontWeight: '600' }} children="@2x" /> and{' '}
            <ThemedText style={{ fontWeight: '600' }} children="@3x" /> suffixes to provide files for
            different screen densities
          </>
        } />
        <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText style={{ color: '#0066cc' }} children="Learn more" />
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Custom fonts">
        <ThemedText children={
          <>
            Open <ThemedText style={{ fontWeight: '600' }} children="app/_layout.tsx" /> to see how to load{' '}
            <ThemedText style={{ fontFamily: 'SpaceMono' }} children="custom fonts such as this one." />
          </>
        } />
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText style={{ color: '#0066cc' }} children="Learn more" />
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText children={
          <>
            This template has light and dark mode support. The{' '}
            <ThemedText style={{ fontWeight: '600' }} children="useColorScheme()" /> hook lets you inspect
            what the user's current color scheme is, and so you can adjust UI colors accordingly.
          </>
        } />
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText style={{ color: '#0066cc' }} children="Learn more" />
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText children={
          <>
            This template includes an example of an animated component. The{' '}
            <ThemedText style={{ fontWeight: '600' }} children="components/HelloWave.tsx" /> component uses
            the powerful <ThemedText style={{ fontWeight: '600' }} children="react-native-reanimated" />{' '}
            library to create a waving hand animation.
          </>
        } />
        {Platform.select({
          ios: (
            <ThemedText children={
              <>
                The <ThemedText style={{ fontWeight: '600' }} children="components/ParallaxScrollView.tsx" />{' '}
                component provides a parallax effect for the header image.
              </>
            } />
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute' as const,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
