'use strict';

import React from 'react';
import { View, ActivityIndicator, Text, Image,   ViewPropTypes, Alert } from 'react-native';
import PropTypes from 'prop-types'
import SketchCanvas from './src/SketchCanvas';
import ResponsiveView from './src/ResponsiveView';

const ResponsiveSketchCanvas = (props) => {

	const [zoom, setZoom] = useState(1);

	const updateZoomLevel = (newZoom) => {
		setZoom(newZoom);
	}

	const { maxZoom, minZoom, scrollEnabled, refCanvas, contentStyle, zoomFactor, backgroundRatio, ...sketchProps } = props;
	return (
		<ResponsiveView
			maxZoomScale={maxZoom}
			minZoomScale={minZoom}
			backgroundRatio={backgroundRatio}
			scrollEnabled={scrollEnabled}
			initialStyle={contentStyle}
			updateZoomLevel={updateZoomLevel}
		>
			<SketchCanvas
				{...sketchProps}
				ref={refCanvas}
				style={[styles.sketch, props.style]}
				scale={zoom}
				requiredTouches={1}
			/>
		</ResponsiveView>
	);
}

const styles = {
	sketch: {
		flex: 1,
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	},
}

export { ResponsiveSketchCanvas };
