import React from 'react';
import { Button } from 'reactstrap';
import { ChannelSearchModal } from './ChannelSearchModal.component';
export const ChannelListSearch = ({
  filters,
  showChannelSearchModal,
  onSearchChannelConfirm,
  onSearchChannelCancel,
  isChannelSearchModalOpen
}) => (
  <div className="chat-search-bar">
    <div className="stylish-input-group">
      <Button
        color="primary"
        className="chat-button"
        onClick={e => {
          showChannelSearchModal();
        }}
      >
        Search
      </Button>
    </div>
    <ChannelSearchModal
      title="Search Channels"
      isChannelSearchModalOpen={isChannelSearchModalOpen}
      handleCancel={onSearchChannelCancel}
      handleConfirm={onSearchChannelConfirm}
      filters={filters}
    />
  </div>
);
