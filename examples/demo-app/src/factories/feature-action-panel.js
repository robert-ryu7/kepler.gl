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

import React, {useCallback, useState} from 'react';
import {connect} from 'react-redux';
import {useIntl} from 'react-intl';
import {ActionPanel, ActionPanelItem, FeatureActionPanelFactory} from '@kepler.gl/components';
import {loadRemoteMap} from '../actions';
import {REMOTE_DATA_URL} from '../constants/default-settings';
import {VisStateActions} from '@kepler.gl/actions';
import classnames from 'classnames';
import {Checkmark, Copy, Layers, Trash, Add} from '@kepler.gl/components/common/icons';
import styled from 'styled-components';
import onClickOutside from 'react-onclickoutside';
import copy from 'copy-to-clipboard';

const LAYOVER_OFFSET = 4;

const StyledActionsLayer = styled.div`
  position: absolute;
`;

function mapStateToProps(state) {
  // TODO: Determine if and how to handle loading state
  return {isMapLoading: state.demo.app.isMapLoading};
}

const mapDispatchToProps = dispatch => {
  return {dispatch};
};

export function CustomFeatureActionPanelFactory() {
  const PureFeatureActionPanel = ({
    isMapLoading,
    dispatch,
    className,
    datasets,
    selectedFeature,
    position,
    layers,
    currentFilter,
    onToggleLayer,
    onDeleteFeature
  }) => {
    const [copied, setCopied] = useState(false);
    const {layerId = []} = currentFilter || {};
    const intl = useIntl();

    const copyGeometry = useCallback(() => {
      if (selectedFeature?.geometry) copy(JSON.stringify(selectedFeature.geometry));
      setCopied(true);
    }, [selectedFeature?.geometry]);

    const handleLoadDataClick = async () => {
      if (isMapLoading || !selectedFeature?.geometry) return;

      const dataUrl = new URL(REMOTE_DATA_URL);
      dataUrl.searchParams.set('polygon', JSON.stringify(selectedFeature.geometry));

      dispatch(VisStateActions.setSelectedFeature(null));
      dispatch(loadRemoteMap({dataUrl}));
    };

    if (!position) {
      return null;
    }

    return (
      <StyledActionsLayer
        className={classnames('feature-action-panel', className)}
        style={{
          top: `${position.y + LAYOVER_OFFSET}px`,
          left: `${position.x + LAYOVER_OFFSET}px`
        }}
      >
        <ActionPanel>
          <ActionPanelItem
            className="editor-layers-list"
            label={intl.formatMessage({id: 'editor.filterLayer', defaultMessage: 'Filter layers'})}
            Icon={Layers}
          >
            {layers.map((layer, index) => (
              <ActionPanelItem
                key={index}
                label={layer.config.label}
                // @ts-ignore
                color={datasets[layer.config.dataId].color}
                isSelection={true}
                isActive={layerId.includes(layer.id)}
                onClick={() => onToggleLayer(layer)}
                className="layer-panel-item"
              />
            ))}
          </ActionPanelItem>
          <ActionPanelItem
            label={intl.formatMessage({id: 'editor.copyGeometry', defaultMessage: 'Copy Geometry'})}
            className="delete-panel-item"
            Icon={copied ? Checkmark : Copy}
            onClick={copyGeometry}
          />
          <ActionPanelItem
            label={intl.formatMessage({id: 'custom.editor.loadData', defaultMessage: 'Load Data'})}
            className="load-data-panel-item"
            Icon={Add}
            onClick={handleLoadDataClick}
          />
          <ActionPanelItem
            label={intl.formatMessage({id: 'tooltip.delete', defaultMessage: 'Delete'})}
            className="delete-panel-item"
            Icon={Trash}
            onClick={onDeleteFeature}
          />
        </ActionPanel>
      </StyledActionsLayer>
    );
  };

  PureFeatureActionPanel.displayName = 'FeatureActionPanel';
  PureFeatureActionPanel.defaultProps = {
    position: null
  };

  const ClickOutsideFeatureActionPanel = props => {
    ClickOutsideFeatureActionPanel.handleClickOutside = e => {
      e.preventDefault();
      e.stopPropagation();
      props.onClose?.();
    };
    return <PureFeatureActionPanel {...props} />;
  };

  const clickOutsideConfig = {
    handleClickOutside: () => ClickOutsideFeatureActionPanel.handleClickOutside
  };

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(onClickOutside(ClickOutsideFeatureActionPanel, clickOutsideConfig));
}

CustomFeatureActionPanelFactory.deps = [];

export function replaceFeatureActionPanel() {
  return [FeatureActionPanelFactory, CustomFeatureActionPanelFactory];
}
