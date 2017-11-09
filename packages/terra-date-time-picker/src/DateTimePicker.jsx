import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import 'terra-base/lib/baseStyles';
import DatePicker from 'terra-date-picker';
import TimeInput from 'terra-time-input';
import DateUtil from 'terra-date-picker/lib/DateUtil';
import styles from './DateTimePicker.scss';
import DateTimeUtils from './DateTimeUtils';
import TimeClarification from './_TimeClarification';

const cx = classNames.bind(styles);

const propTypes = {
  /**
   * Custom input attributes to apply to the date input. Use the name prop to set the name for the date input.
   * Do not set the name in inputAttribute as it will be ignored.
   */
  dateInputAttributes: PropTypes.object,
  /**
   * An array of ISO 8601 string representation of the dates to disable in the picker.
   */
  excludeDates: PropTypes.arrayOf(PropTypes.string),
  /**
   * A function that gets called for each date in the picker to evaluate which date should be disabled.
   * A return value of true will be enabled and false will be disabled.
   */
  filterDate: PropTypes.func,
  /**
   * An array of ISO 8601 string representation of the dates to enable in the picker.
   * All Other dates will be disabled.
   */
  includeDates: PropTypes.arrayOf(PropTypes.string),
  /**
   * An ISO 8601 string representation of the maximum date time.
   */
  maxDateTime: PropTypes.string,
  /**
   * An ISO 8601 string representation of the minimum date time.
   */
  minDateTime: PropTypes.string,
  /**
   * Name of the date input. The name should be unique.
   */
  name: PropTypes.string.isRequired,
  /**
   * A callback function to execute when a valid date is selected or entered.
   * The first parameter is the event. The second parameter is the changed input value.
   */
  onChange: PropTypes.func,
  /**
   * A callback function to execute when a change is made in the date or time input.
   * The first parameter is the event. The second parameter is the changed input value.
   */
  onChangeRaw: PropTypes.func,
  /**
   * A callback function to let the containing component (e.g. modal) to regain focus.
   */
  releaseFocus: PropTypes.func,
  /**
   * A callback function to request focus from the containing component (e.g. modal).
   */
  requestFocus: PropTypes.func,
  /**
   * Custom input attributes to apply to the time input. Use the name prop to set the name for the time input.
   * Do not set the name in inputAttribute as it will be ignored.
   */
  timeInputAttributes: PropTypes.object,
  /**
   * An ISO 8601 string representation of the initial value to show in the date and time inputs.
   */
  value: PropTypes.string,
};

const defaultProps = {
  dateInputAttributes: undefined,
  excludeDates: undefined,
  filterDate: undefined,
  includeDates: undefined,
  maxDateTime: undefined,
  minDateTime: undefined,
  name: undefined,
  onChange: undefined,
  onChangeRaw: undefined,
  releaseFocus: undefined,
  requestFocus: undefined,
  timeInputAttributes: undefined,
  value: undefined,
};

const contextTypes = {
  /* eslint-disable consistent-return */
  intl: (context) => {
    if (context.intl === undefined) {
      return new Error('Please add locale prop to Base component to load translations');
    }
  },
};

const keyCodes = {
  ARROWDOWN: 40,
};

class DateTimePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dateTime: DateTimeUtils.createSafeDate(props.value),
      isAmbiguousTime: false,
      isTimeClarificationOpen: false,
    };

    // The dateValue and timeValue variables represent the actual value in the date input and time input respectively.
    // They are used to keep track of the currently entered value to determine whether or not the entry is valid.
    // Unlike dateValue and timeValue, this.state.dateTime is the internal moment object representing both the date and time as one entity
    // It is used for date/time minuipulation and used to calculate the missing/ambiguous hour.
    // The dateValue and timeValue are tracked outside of the react state to limit the number of renderings that occur.
    this.dateValue = '';
    this.timeValue = '';

    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleDateChangeRaw = this.handleDateChangeRaw.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleOnSelect = this.handleOnSelect.bind(this);
    this.handleOnDateBlur = this.handleOnDateBlur.bind(this);
    this.handleOnTimeBlur = this.handleOnTimeBlur.bind(this);

    this.handleDaylightSavingButtonClick = this.handleDaylightSavingButtonClick.bind(this);
    this.handleStandardTimeButtonClick = this.handleStandardTimeButtonClick.bind(this);
  }

  componentWillMount() {
    const dateFormat = DateUtil.getFormatByLocale(this.context.intl.locale);

    this.dateValue = DateTimeUtils.formatMomentDateTime(this.state.dateTime, dateFormat);
    this.timeValue = DateTimeUtils.hasTime(this.props.value) ? DateTimeUtils.formatISODateTime(this.props.value, 'HH:mm') : '';
  }

  handleOnSelect(event, selectedDate) {
    const dateFormat = DateUtil.getFormatByLocale(this.context.intl.locale);
    this.dateValue = DateTimeUtils.formatISODateTime(selectedDate, dateFormat);
    const previousDateTime = this.state.dateTime ? this.state.dateTime.clone() : null;
    const updatedDateTime = DateTimeUtils.syncDateTime(previousDateTime, selectedDate, this.timeValue);

    if (!previousDateTime || previousDateTime.format() !== updatedDateTime.format()) {
      this.checkAmbiguousTime(updatedDateTime);
    }
  }

  handleOnDateBlur(event) {
    const dateFormat = DateUtil.getFormatByLocale(this.context.intl.locale);
    const isDateTimeValid = DateTimeUtils.isValidDateTime(event.target.value, this.timeValue, dateFormat);
    const enteredDateTime = isDateTimeValid ? this.state.dateTime : null;

    this.checkAmbiguousTime(enteredDateTime);
  }

  handleOnTimeBlur() {
    const dateFormat = DateUtil.getFormatByLocale(this.context.intl.locale);
    const isDateTimeValid = DateTimeUtils.isValidDateTime(this.dateValue, this.timeValue, dateFormat);
    let updatedDateTime;

    if (isDateTimeValid) {
      updatedDateTime = DateTimeUtils.updateTime(this.state.dateTime, this.timeValue);
    }

    this.checkAmbiguousTime(updatedDateTime);
  }

  checkAmbiguousTime(dateTime) {
    // To prevent multiple time clarification dialogs from rendering, ensure that it is not open before checking for the ambiguous hour.
    // One situation is when using the right arrow key to move focus from the hour input to the minute input, it will invoke onBlur and check for ambiguous hour.
    // If the hour is ambiguous, the dialog would display and steal focus from the minute input, which again will invoke onBlur and check for ambiguous hour.
    if (this.state.isTimeClarificationOpen) {
      return;
    }

    let isDateTimeAmbiguous = false;
    const isOldTimeAmbiguous = this.state.isAmbiguousTime;
    if (dateTime && dateTime.isValid()) {
      const tempDateTime = dateTime.clone();
      isDateTimeAmbiguous = DateTimeUtils.checkAmbiguousTime(tempDateTime);
    }

    this.setState({
      isAmbiguousTime: isDateTimeAmbiguous,
      isTimeClarificationOpen: isDateTimeAmbiguous && !isOldTimeAmbiguous,
    });
  }

  handleDateChange(event, date) {
    if (event.type === 'change') {
      this.dateValue = event.target.value;
    }

    let updatedDateTime;
    const formattedDate = DateTimeUtils.formatISODateTime(date, 'YYYY-MM-DD');

    if (DateTimeUtils.isValidDate(formattedDate, 'YYYY-MM-DD')) {
      const previousDateTime = this.state.dateTime ? this.state.dateTime.clone() : null;
      updatedDateTime = DateTimeUtils.syncDateTime(previousDateTime, date, this.timeValue);

      if (DateTimeUtils.isValidTime(this.timeValue)) {
        this.timeValue = DateTimeUtils.formatISODateTime(updatedDateTime.format(), 'HH:mm');
      }
    }

    this.handleChange(event, updatedDateTime);
  }

  handleDateChangeRaw(event, date) {
    this.dateValue = event.target.value;
    this.handleChangeRaw(event, date);
  }

  handleTimeChange(event, time) {
    this.timeValue = time;
    const dateFormat = DateUtil.getFormatByLocale(this.context.intl.locale);
    const validDate = DateTimeUtils.isValidDate(this.dateValue, dateFormat);
    const validTime = DateTimeUtils.isValidTime(this.timeValue);
    const previousDateTime = this.state.dateTime ? this.state.dateTime.clone() : null;

    // If both date and time are valid, check if the time is the missing hour and invoke onChange.
    // If the date is valid but time is invalid, the time in the dateTime state needs to be cleared and render.
    if (validDate && validTime) {
      const updatedDateTime = DateTimeUtils.updateTime(previousDateTime, time);

      if (event.keyCode === keyCodes.ARROWDOWN &&
        previousDateTime && updatedDateTime && previousDateTime.format() === updatedDateTime.format()) {
        updatedDateTime.subtract(1, 'hours');
      }

      this.timeValue = DateTimeUtils.formatISODateTime(updatedDateTime.format(), 'HH:mm');
      this.handleChangeRaw(event, this.timeValue);
      this.handleChange(event, updatedDateTime);
    } else {
      // If the date is valid but the time is not, the time part in the dateTime state needs to be cleared to reflect the change.
      if (validDate && !validTime) {
        const updatedDateTime = DateTimeUtils.updateTime(previousDateTime, '00:00');

        this.setState({
          dateTime: updatedDateTime,
        });
      }

      this.handleChangeRaw(event, time);
    }
  }

  handleChange(event, newDateTime) {
    this.setState({
      dateTime: newDateTime,
    });

    if (this.props.onChange) {
      this.props.onChange(event, newDateTime && newDateTime.isValid() ? newDateTime.format() : '');
    }
  }

  handleChangeRaw(event, value) {
    if (this.props.onChangeRaw) {
      this.props.onChangeRaw(event, value);
    }
  }

  handleDaylightSavingButtonClick() {
    this.setState({ isTimeClarificationOpen: false });
    const newDateTime = this.state.dateTime.clone();

    if (!newDateTime.isDST()) {
      newDateTime.subtract(1, 'hour');
      this.handleChange(event, newDateTime);
    }
  }

  handleStandardTimeButtonClick(event) {
    this.setState({ isTimeClarificationOpen: false });
    const newDateTime = this.state.dateTime.clone();

    if (newDateTime.isDST()) {
      newDateTime.add(1, 'hour');
      this.handleChange(event, newDateTime);
    }
  }

  renderTimeClarification() {
    return (
      <TimeClarification
        isOpen={this.state.isTimeClarificationOpen}
        isOffsetButtonHidden={!this.state.isAmbiguousTime}
        onDaylightSavingButtonClick={this.handleDaylightSavingButtonClick}
        onStandardTimeButtonClick={this.handleStandardTimeButtonClick}
      />
    );
  }

  render() {
    const {
      dateInputAttributes,
      excludeDates,
      filterDate,
      includeDates,
      onChange,
      onChangeRaw,
      maxDateTime,
      minDateTime,
      name,
      requestFocus,
      releaseFocus,
      timeInputAttributes,
      value,
      ...customProps
    } = this.props;

    const dateTime = this.state.dateTime ? this.state.dateTime.clone() : null;
    const dateValue = DateTimeUtils.formatMomentDateTime(dateTime, 'YYYY-MM-DD');

    return (
      <div {...customProps} className={cx('date-time-picker')}>
        <input
          // Create a hidden input for storing the name and value attributes to use when submitting the form.
          // The data stored in the value attribute will be the visible date in the date input but in ISO 8601 format.
          data-terra-date-time-input-hidden
          type="hidden"
          name={name}
          value={dateTime && dateTime.isValid() ? dateTime.format() : ''}
        />

        <DatePicker
          onChange={this.handleDateChange}
          onChangeRaw={this.handleDateChangeRaw}
          onSelect={this.handleOnSelect}
          onClickOutside={this.handleOnClickOutside}
          onBlur={this.handleOnDateBlur}
          excludeDates={excludeDates}
          filterDate={filterDate}
          includeDates={includeDates}
          inputAttributes={dateInputAttributes}
          maxDate={maxDateTime}
          minDate={minDateTime}
          selectedDate={dateValue}
          name="input"
          releaseFocus={releaseFocus}
          requestFocus={requestFocus}
        />

        <div className={cx('time-facade')}>
          <TimeInput
            onBlur={this.handleOnTimeBlur}
            onChange={this.handleTimeChange}
            inputAttributes={timeInputAttributes}
            name="input"
            value={this.timeValue}
          />

          {this.state.isAmbiguousTime ? this.renderTimeClarification() : null }
        </div>
      </div>
    );
  }
}

DateTimePicker.propTypes = propTypes;
DateTimePicker.defaultProps = defaultProps;
DateTimePicker.contextTypes = contextTypes;

export default DateTimePicker;