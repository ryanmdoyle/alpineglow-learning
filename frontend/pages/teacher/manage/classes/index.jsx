import React, { useContext } from 'react';
import { css } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks'
import Link from 'next/link';
import Router from 'next/router';

import PageTitle from '../../../../components/PageTitle';
import Loading from '../../../../components/Loading';
import PagePadding from '../../../../components/styled/blocks/PagePadding';
import CreateClassForm from '../../../../components/forms/create/CreateClassForm';
import TextButton from '../../../../components/styled/elements/TextButton';
import ModalContext from '../../../../components/context/ModalContext';
import { GET_INSTRUCTING_COURSES } from '../../../../gql/queries';

import { TextTableContainer, TextTableHeader, TextTableRow} from '../../../../components/styled/tables/TextTable';

const teacherClasses = () => {
  const { loading, error, data } = useQuery(GET_INSTRUCTING_COURSES);
  const modal = useContext(ModalContext);

  if (error) return null;
  if (loading) return <Loading />
  return (
    <div>
      <PageTitle>Manage Your Classes</PageTitle>
      <PagePadding>
        {data?.getInstructingCourses?.map(course => (
          <div key={course._id}>
            <h4>{course.name}</h4>
            {course.classes.length === 0 && (
              <p>You currently don't have any classes enrolled in Math 6. Click below to add your first class!</p>
            )}
            {course.classes.length !== 0 && (
              <TextTableContainer>
                <TextTableHeader>
                  <span>Class Name</span>
                  <span>Enroll ID</span>
                  <span>Students Enrolled</span>
                </TextTableHeader>
                {course.classes.map(c => {
                  return (
                      <TextTableRow key={c._id} linkHref='/teacher/manage/classes/[classId]' linkAs={`/teacher/manage/classes/${c._id}`}>
                        <span className='first-column'>{c.name}</span>
                        <span>{c.enrollId}</span>
                        <span>{c.enrolled.length}</span>
                    </TextTableRow>
                  )
                })}
              </TextTableContainer>
            )}
            <div css={css`display: flex; justify-content: flex-end;`}>
            <TextButton onClick={() => {
                  modal.setChildComponent(<CreateClassForm courseId={course._id} />);
                  modal.open();
                }}>{`Add class to ${course.name}`}</TextButton>

            </div>
          </div>
        ))}

      </PagePadding>
    </div >
  );
};

export default teacherClasses;