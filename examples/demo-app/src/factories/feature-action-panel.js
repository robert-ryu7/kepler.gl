// Copyright (c) 2023 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React from 'react';
import {connect} from 'react-redux';
import {useIntl} from 'react-intl';
import {FeatureActionPanelFactory, Icons, ActionPanelItem} from '@kepler.gl/components';
import {loadRemoteMap} from '../actions';
import {REMOTE_DATA_URL} from '../constants/default-settings';
import {VisStateActions} from '@kepler.gl/actions';

function mapStateToProps(state) {
  // TODO: Determine if and how to handle loading state
  return {isMapLoading: state.demo.app.isMapLoading};
}

const mapDispatchToProps = dispatch => {
  return {dispatch};
};

export function CustomFeatureActionPanelFactory(...deps) {
  const FeatureActionPanel = FeatureActionPanelFactory(...deps);
  const Component = props => {
    const intl = useIntl();

    const handleLoadDataClick = async () => {
      if (props.isMapLoading) return;

      const dataUrl = new URL(REMOTE_DATA_URL);
      dataUrl.searchParams.set('polygon', JSON.stringify(props.selectedFeature.geometry));

      props.dispatch(VisStateActions.setSelectedFeature(null));
      props.dispatch(loadRemoteMap({dataUrl}));
    };

    return (
      <FeatureActionPanel {...props}>
        <ActionPanelItem
          label={intl.formatMessage({id: 'custom.editor.loadData', defaultMessage: 'Load Data'})}
          className="load-data-panel-item"
          Icon={Icons.Add}
          onClick={handleLoadDataClick}
        />
      </FeatureActionPanel>
    );
  };

  return connect(mapStateToProps, mapDispatchToProps)(Component);
}

CustomFeatureActionPanelFactory.deps = FeatureActionPanelFactory.deps;

export function replaceFeatureActionPanel() {
  return [FeatureActionPanelFactory, CustomFeatureActionPanelFactory];
}
