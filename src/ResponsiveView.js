import React, { useRef, useState, useEffect, Component } from 'react';
import { Animated, Dimensions, Easing, PanResponder, StyleSheet, View, Platform } from 'react-native';
import {
	PinchGestureHandler,
	PanGestureHandler,
	PinchGestureHandlerEventPayload,
	HandlerStateChangeEvent
} from 'react-native-gesture-handler';

const ResponsiveView = (props) => {

	const { updateZoomLevel, minZoomScale, maxZoomScale, backgroundRatio = 1 } = props;
	
	const calcDistance = (x1, y1, x2, y2) => {
		const dx = Math.abs(x1 - x2);
		const dy = Math.abs(y1 - y2);
		return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
	}
	
	const pan = useRef(new Animated.ValueXY()).current;
	const translateX = Animated.diffClamp(pan.x, 0, 100);
	const translateY = Animated.diffClamp(pan.y, 0, 100);

	const [zoom, setZoom] = useState(new Animated.Value(1));
	const [initDistance, setInitDistance] = useState(-1)
	const width = useRef(0)
	const height = useRef(0)

	useEffect(() => {
		updateZoomLevel(1.0);
	}, [])

	const panResponder =
		
		PanResponder.create({
			
			onStartShouldSetPanResponder: (evt, gestureState) => gestureState.numberActiveTouches === 2,
			onStartShouldSetPanResponderCapture: (evt, gestureState) => gestureState.numberActiveTouches === 2,
			onMoveShouldSetPanResponder: (evt, gestureState) => gestureState.numberActiveTouches === 2,
			onMoveShouldSetPanResponderCapture: (evt, gestureState) => gestureState.numberActiveTouches === 2,
			onPanResponderGrant: (e, gestureState) => {
				if (gestureState.numberActiveTouches === 2) {
					pan.setOffset({
						x: pan.x._value,
						y: pan.y._value
					  });
				}
			},
			onPanResponderMove: (evt, gestureState) => {
				if (evt.nativeEvent?.changedTouches?.length === 2) {
					const touch1 = evt.nativeEvent?.changedTouches[0];
					const touch2 = evt.nativeEvent?.changedTouches[1];
					const distance = calcDistance(touch1.locationX, touch1.locationY, touch2.locationX, touch2.locationY)
					if (initDistance >= 0) {
						// deltaZoom is used in order to avoid to zoom as soon as the user uses two fingers on the screen (for scrolling for instance)
						let deltaZoom = (distance / initDistance - 1 ) / (4 - (zoom._value - 1));
						//console.log(`distance : ${distance} ; initDistance : ${initDistance} ; zoom : ${zoom._value} ; delta zoom : ${deltaZoom} ; minZoom : ${minZoomScale} ; maxZoom : ${maxZoomScale}`)
						if (Math.abs(deltaZoom) > 0.1) {
							newZoom = zoom._value + deltaZoom * 0.15;
							if (newZoom > maxZoomScale) {
								//console.log(`newZoom : ${newZoom} ; max : ${maxZoomScale}`)
								newZoom = maxZoomScale;
							} else if (newZoom < minZoomScale) {
								//console.log(`newZoom : ${newZoom} ; min : ${minZoomScale}`)

								newZoom = minZoomScale;
							}
							gestureState.scale = newZoom

						}
					} else {
						setInitDistance(distance);
					}

					if(gestureState.scale)
						return Animated.event([
							null,
							{ dx: pan.x, dy: pan.y, scale: zoom }
						],
						{useNativeDriver: false})(evt, gestureState)
					else 
						return Animated.event([
							null,
							{ dx: pan.x, dy: pan.y }
						],
						{useNativeDriver: false})(evt, gestureState)
				}
			},
			onPanResponderRelease: () => {
				let triggerAnim = false;
				
				pan.flattenOffset();

				const currentX = pan.x._value + pan.x._offset
				const currentY = pan.y._value + pan.y._offset

				// limits  are computed considering that (0, 0) position is located at the center of the view
				const xMaxAbs = width.current * (zoom._value - 1) / 2
				const yMaxAbs = height.current * (zoom._value - 1) * backgroundRatio / 2
				
				// when user releases touch, check if canvas iis "out of limit"
				// if true, trigger animation that return to max authorized values
				let toX=currentX, toY=currentY;
				//console.log(currentX, currentY, xMaxAbs, yMaxAbs)

				if (Math.abs(currentX) > xMaxAbs) {
					triggerAnim = true;
					if (currentX < 0) toX = -xMaxAbs
					else toX = xMaxAbs
				}
				if (Math.abs(currentY) > yMaxAbs) {
					triggerAnim = true;
					if (currentY < 0) toY = -yMaxAbs
					else toY = yMaxAbs
				}
				
				if (triggerAnim) {
					Animated.timing(pan, {
						toValue: {x: toX, y: toY},
						duration: 200,
						useNativeDriver: false
					   },
					   ).start();
				}

				setInitDistance(-1);
				updateZoomLevel(zoom._value)
			  }
		})
	  

	  return (
		<View
			style={styles.viewport}
			onLayout={event => {
				const layout = event.nativeEvent.layout;
				width.current = layout.width;
				height.current = layout.height;
			  }}
		>	
				<Animated.View {...panResponder.panHandlers} style={[props.initialStyle, { transform: [{ translateX: pan.x }, { translateY: pan.y}, { scaleX: zoom }, { scaleY: zoom }] }]}>
					{props.children}
				</Animated.View>
		</View>
	);
}

ResponsiveView.defaultProps = {
	maxZoomScale: 2,
	minZoomScale: 0.2,
};

const styles = StyleSheet.create({

	viewport: {
		height: '100%',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},

});

export default ResponsiveView