import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SideNav from '../presentational/userSideNav';
import { searchUser } from '../../actions/search';
import { addMember, getGroupMembers, addMemberSuccess } from '../../actions/groupAction';
import GroupMembers from './groupMembers';

class AddMembers extends React.Component {
  constructor() {
    super();
    this.handleSearch = this.handleSearch.bind(this);
    this.addMembers = this.addMembers.bind(this);
  }
  handleSearch(event) {
    const groupId = this.props.match.params.groupId;
    const userInput = event.target.value;
    if (userInput.length > 1) {
      this.props.searchUsers(userInput, groupId);
    }
  }
  addMembers(userId) {
    const groupId = this.props.match.params.groupId;
    this.props.addMember(userId, groupId);
  }
  render() {
    let searchResult;
    const groupId = this.props.match.params.groupId;
    if (this.props.addMemberSuccess) {
      this.props.getGroupMembers(this.props.match.params.groupId);
      this.props.setAddMembersSucces(false);
    }
    if (this.props.searchResult.searchResult) {
      const searchResultArray = this.props.searchResult.searchResult.users;
      if (searchResultArray.length > 0) {
        searchResult = (
          <ul className="collection" >
            {searchResultArray.map(user => (
              <li className="collection-item" key={user.id}>
                <a
                  className="right small btn"
                  onClick={() => { this.addMembers(user.id, groupId); }}
                > Add
                </a>
                {user.fullName}
                <div className="clearfix" />
              </li>
          ))
          }
          </ul>
      );
      } else {
        searchResult = '';
      }
    }
    return (
      <div className="row">
        <SideNav />
        <div className="col m6 component-container" >
          <h5 className="center">Search users</h5>
          <form>
            <div className="input-field">
              <input id="search" type="search" autoComplete="off" name="userSearch" onChange={this.handleSearch} />
              <label htmlFor="search"> Search users </label>
            </div>
          </form>
          {searchResult}
        </div>
        {/* <GroupMembers groupId={this.props.match.params.groupId} history={this.props.history} /> */}
      </div>
    );
  }
}
AddMembers.propTypes = {
  searchUsers: PropTypes.func.isRequired,
  addMember: PropTypes.func.isRequired,
  getGroupMembers: PropTypes.func.isRequired,
  setAddMembersSucces: PropTypes.func.isRequired,
  addMemberSuccess: PropTypes.bool.isRequired,
};
const mapStateToProps = state => (
  {
    searchResult: state.searchReducer,
    addMemberSuccess: state.addMemberSuccess,
  }
);
const mapDispatchToProps = dispatch => (
  {
    searchUsers: (userInput, groupId) => {
      dispatch(searchUser(userInput, groupId));
    },
    addMember: (userId, groupId) => {
      dispatch(addMember(userId, groupId));
    },
    getGroupMembers: (groupId) => {
      dispatch(getGroupMembers(groupId));
    },
    setAddMembersSucces: (bool) => {
      dispatch(addMemberSuccess(bool));
    },
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(AddMembers);
