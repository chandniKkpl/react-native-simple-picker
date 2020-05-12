import React, { Component } from 'react'; // eslint-disable-line

import PropTypes from 'prop-types';

import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Modal,
	Picker,
	Dimensions,
	TouchableWithoutFeedback,
  Animated,
	SafeAreaView,
  Platform,
} from 'react-native'; // eslint-disable-line

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = {
	overlayContainer: {
	  zIndex: -1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    opacity: 0.3,
	},

	mainBox: {
		// Can be used by <SimplePicker styles={{ mainBox:{...} }}/>
	},

	modalContainer: {
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 0,
		backgroundColor: '#F5FCFF',
	},

	buttonView: {
		width: '100%',
		padding: 8,
		borderTopWidth: 0.5,
		borderTopColor: 'lightgrey',
		justifyContent: 'space-between',
		flexDirection: 'row',
	},

	bottomPicker: {
		width: SCREEN_WIDTH,
	},
};

const propTypes = {
	buttonColor: PropTypes.string,
	buttonStyle: PropTypes.object,
	cancelText: PropTypes.string,
	cancelTextStyle: PropTypes.object,
	confirmText: PropTypes.string,
	confirmTextStyle: PropTypes.object,
	disableOverlay: PropTypes.bool,
	initialOptionIndex: PropTypes.number,
	itemStyle: PropTypes.object,
	labels: PropTypes.array,
	modalVisible: PropTypes.bool,
	onCancel: PropTypes.func,
	onSubmit: PropTypes.func,
	options: PropTypes.array.isRequired,
	styles: PropTypes.object,
    isMulti: PropTypes.bool
};


const booleanIsSet = variable => variable || String(variable) === 'false';

class SimplePicker extends Component {
	constructor(props) {
		super(props);

		const selected = props.initialOptionIndex || 0;

		this.state = {
			modalVisible: props.modalVisible || false,
			selectedOption: props.options[selected] || props.options[selected],
            translateY: new Animated.Value(0),
            previousOption: props.options[selected]
		};

		this.styles = StyleSheet.create({
			...styles,
			...props.styles,
		});

		this.onPressCancel = this.onPressCancel.bind(this);
		this.onPressSubmit = this.onPressSubmit.bind(this);
		this.onValueChange = this.onValueChange.bind(this);
		this.onOverlayDismiss = this.onOverlayDismiss.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		// If initial option index is changed we need to update the code.
		if (nextProps.initialOptionIndex !== this.props.initialOptionIndex) {
			this.setState({
				selectedOption: nextProps.options[nextProps.initialOptionIndex || 0],
			});
		}

		// If options are updated and our current selected option
		// is not part of the new options.
		if (
			nextProps.options
			&& nextProps.options.length > 0
			&& nextProps.options.indexOf(this.state.selectedOption) === -1
		) {
			const previousOption = this.state.selectedOption;
			this.setState({
				selectedOption: nextProps.options[nextProps.initialOptionIndex || 0],
			}, () => {
				// Options array changed and the previously selected option is not present anymore.
				// Should call onSubmit function to tell parent to handle the change too.
				if (previousOption) {
					this.onPressSubmit();
				}
			});
		}

		if (booleanIsSet(nextProps.modalVisible)) {
			this.setState({
				modalVisible: nextProps.modalVisible,
			});
		}
	}

	onPressCancel() {
		if (this.props.onCancel) {
			this.props.onCancel(this.state.selectedOption);
		}

		this.hide();
	}

	onPressSubmit(option) {
		this.setState({
			selectedOption: option,
            previousOption: option
		});
		if (this.props.onSubmit) {
			this.props.onSubmit(option);
		}

		//this.hide();
	}

	onOverlayDismiss() {
		// To make first choice selected when picker dismiss 
		// if (this.props.onCancel) {
		// 	this.props.onCancel(this.state.selectedOption);
		// }
        if(this.props.isMulti === false && this.state.previousOption !== this.state.selectedOption)
        {
            this.onPressSubmit(this.state.selectedOption);
        }
        if (this.props.isMulti === true){
            this.onPressSubmit(this.state.selectedOption);
        }
		this.hide();
	}

	onValueChange(option) {
		this.setState({
			selectedOption: option,
		});
	}

	show() {
		this.setState({
			modalVisible: true,
		});
    Animated.timing(
      this.state.translateY,
      { toValue: Platform.OS === 'ios' ? -250 : -85 }
    ).start();
	}

	hide() {
    Animated.timing(
      this.state.translateY,
      { toValue: 0 }
    ).start(() => this.setState({ modalVisible: false }));
	}

	renderItem(option, index) {
		const label = (this.props.labels) ? this.props.labels[index] : option;

		return (
			<Picker.Item
				key={option}
				value={option}
				label={label}
			>
				{/* <TouchableOpacity onPress={(option)=>this.onPressSubmit(option)} style={{width:'100%', height:'100%', backgroundColor:'pink'}}></TouchableOpacity> */}
				</Picker.Item>
		);
	}

	render() {
		const { modalVisible, selectedOption, translateY } = this.state;
		const {
			options,
			buttonStyle,
			itemStyle,
			cancelText,
			cancelTextStyle,
			confirmText,
			confirmTextStyle,
			disableOverlay,
		} = this.props;

    const transformStyle = {
      transform: [{ translateY }]
    };

    return (
       <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={this.onPressCancel}
          supportedOrientations={['portrait', 'landscape']}
        >
          {!disableOverlay &&
          <TouchableWithoutFeedback onPress={this.onOverlayDismiss}>
            <View style={this.styles.overlayContainer}/>
          </TouchableWithoutFeedback>
          }
			<SafeAreaView>
          <Animated.View style={[this.styles.modalContainer, transformStyle]}>
            <View style={this.styles.buttonView}>
              <TouchableOpacity >
                <Text style={[buttonStyle, cancelTextStyle]}>
                  {/* {cancelText || 'Cancel'} */}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity >
                <Text style={[buttonStyle, confirmTextStyle]}>
                  {/* {confirmText || 'Confirm'} */}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={this.styles.mainBox}>
              <Picker
                style={this.styles.bottomPicker}
                selectedValue={selectedOption}
                onValueChange={(option)=>this.onValueChange(option)}
                itemStyle={itemStyle}
              >
                {options.map((option, index) => this.renderItem(option, index))}
              </Picker>
            </View>
          </Animated.View>
		</SafeAreaView>
        </Modal>
    );
	}
}

SimplePicker.defaultProps = {
	styles: {},
    isMulti: false
};

SimplePicker.propTypes = propTypes;

module.exports = SimplePicker;
