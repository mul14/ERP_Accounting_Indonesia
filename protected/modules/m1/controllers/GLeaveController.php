<?php

class GLeaveController extends Controller {

    /**
     * @var string the default layout for the views. Defaults to '//layouts/column2', meaning
     * using two-column layout. See 'protected/views/layouts/column2.php'.
     */
    public $layout = '//layouts/column2left';

    /**
     * @return array action filters
     */
    public function filters() {
        return array(
            //array(
            //	'CHttpCacheFilter + index',
            //'lastModified'=>Yii::app()->db->createCommand("SELECT MAX(`updated_date`) FROM g_leave")->queryScalar(),
            //),
            'rights',
            'ajaxOnly + approved',
        );
    }

    /**
     * Displays a particular model.
     * @param integer $id the ID of the model to be displayed
     */
    public function actionView($id) {
        $this->render('view', array(
            'model' => $this->loadModel($id),
        ));
    }

    /**
     * Creates a new model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     */
    public function actionCreate() {
        $model = new gLeave;
        $model->setScenario('create');

        // Uncomment the following line if AJAX validation is needed
        // $this->performAjaxValidation($model);

        if (isset($_POST['gLeave'])) {
            $model->attributes = $_POST['gLeave'];
            $model->input_date=date('d-m-Y');
            $model->approved_id = 1; ///request
            if ($model->save())
                $this->redirect(array('/m1/gLeave'));
        }

        $this->render('createWithEmp', array(
            'model' => $model,
        ));
    }

    public function actionCancellation() {
        $model = new gLeave;

        // Uncomment the following line if AJAX validation is needed
        // $this->performAjaxValidation($model);

        if (isset($_POST['gLeave'])) {
            $model->attributes = $_POST['gLeave'];
            $model->approved_id = 8; ///Automatic Updated
            if ($model->save()) {
                $this->actionApproved($model->id, $model->parent_id);

                $this->redirect(array('/m1/gLeave/view', 'id' => $model->parent_id));
            }
        }

        $this->render('cancellationWithEmp', array(
            'model' => $model,
        ));
    }

    public function actionExtended() {
        $model = new gLeave;

        // Uncomment the following line if AJAX validation is needed
        // $this->performAjaxValidation($model);

        if (isset($_POST['gLeave'])) {
            $model->attributes = $_POST['gLeave'];
            $model->approved_id = 5; //Request Extended and will turn to 7 on actionApproved
            if ($model->save()) {
                $this->actionApproved($model->id, $model->parent_id);

                $this->redirect(array('/m1/gLeave/view', 'id' => $model->parent_id));
            }
        }

        $this->render('extendedWithEmp', array(
            'model' => $model,
        ));
    }

    /**
     * Updates a particular model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id the ID of the model to be updated
     */
    public function actionUpdate($id) {
        $model = $this->loadModelLeave($id);

        // Uncomment the following line if AJAX validation is needed
        // $this->performAjaxValidation($model);

        if (isset($_POST['gLeave'])) {
            $model->attributes = $_POST['gLeave'];
            if ($model->save())
            //$this->redirect(array('/m1/gLeave'));
                EQuickDlgs::checkDialogJsScript();
        }

        EQuickDlgs::render('_formUpdate', array('model' => $model));
    }

    public function actionAutoGeneratedLeave($id) {
        $model = gPerson::model()->findByPk($id);

        if (isset($model->leaveBalance) && $model->leaveBalance->mass_leave <= -1) {
            $mass_leave = $model->leaveBalance->mass_leave;
        }
        else
            $mass_leave = 0;

        if (isset($model->leaveBalance) && $model->leaveBalance->person_leave <= -1) {
            $private_leave = $model->leaveBalance->person_leave;
        }
        else
            $private_leave = 0;

        if (isset($model->leaveBalance) && $model->leaveBalance->balance <= -1) {
            $balance = $model->leaveBalance->balance;
        }
        else
            $balance = 0;

        $new_mass_leave = Yii::app()->params['currentYearMassLeave'] + $mass_leave;
        $new_private_leave = Yii::app()->params['currentYearPrivateLeave'] + $private_leave;
        $new_balance = 12 + $balance;

        $_md = date('Y') . "-" . date("m", strtotime($model->companyfirst->start_date)) . "-" . date("d", strtotime($model->companyfirst->start_date));
        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, year_leave , number_of_day, start_date , end_date  , leave_reason  , mass_leave, person_leave, balance, remark, approved_id) VALUES 
		(" . $id . "  ,'" . $_md . "' ,12,12,'" . $_md . "'  ,'" . $_md . "' ,'Auto Generated Leave'," . $new_mass_leave . "," . $new_private_leave . ",
		" . $new_balance . ",'Auto Generated Leave',9)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

    public function actionMassLeaveChristmas($id) {
        $model = gPerson::model()->findByPk($id);
        if (isset($model->leaveBalance)) {
            $mass_leave = $model->leaveBalance->mass_leave;
        }
        else
            $mass_leave = 0;

        if (isset($model->leaveBalance)) {
            $private_leave = $model->leaveBalance->person_leave;
        }
        else
            $private_leave = 0;

        if (isset($model->leaveBalance)) {
            $balance = $model->leaveBalance->balance;
        }
        else
            $balance = 0;

        $new_mass_leave = $mass_leave - Yii::app()->params['currentYearMassLeaveChristmas'];
        $new_balance = $balance - Yii::app()->params['currentYearMassLeaveChristmas'];

        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, start_date, end_date, number_of_day, leave_reason, mass_leave, person_leave, balance, approved_id) VALUES 
		(" . $id . ",'" . Yii::app()->params['currentYearChristmasStart'] . "','" . Yii::app()->params['currentYearChristmasStart'] . "',
		'" . Yii::app()->params['currentYearChristmasEnd'] . "'," . Yii::app()->params['currentYearMassLeaveChristmas'] . ",
		'Cuti Masal Natal " . date('Y') . "'," . $new_mass_leave . "," . $private_leave . "," . $new_balance . ",2)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

    public function actionMassLeaveLebaran($id) {
        $model = gPerson::model()->findByPk($id);

        if (isset($model->leaveBalance)) {
            $mass_leave = $model->leaveBalance->mass_leave;
        }
        else
            $mass_leave = 0;

        if (isset($model->leaveBalance)) {
            $private_leave = $model->leaveBalance->person_leave;
        }
        else
            $private_leave = 0;

        if (isset($model->leaveBalance)) {
            $balance = $model->leaveBalance->balance;
        }
        else
            $balance = 0;

        $new_mass_leave = $mass_leave - Yii::app()->params['currentYearMassLeaveLebaran'];
        $new_balance = $balance - Yii::app()->params['currentYearMassLeaveLebaran'];

        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, start_date, end_date, number_of_day, leave_reason, mass_leave, person_leave, balance, approved_id) VALUES 
		(" . $id . ",'" . Yii::app()->params['currentYearLebaranStart'] . "','" . Yii::app()->params['currentYearLebaranStart'] . "',
		'" . Yii::app()->params['currentYearLebaranEnd'] . "'," . Yii::app()->params['currentYearMassLeaveLebaran'] . ",
		'Cuti Masal Lebaran " . date('Y') . "'," . $new_mass_leave . "," . $private_leave . "," . $new_balance . ",2)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

    /**
     * Deletes a particular model.
     * If deletion is successful, the browser will be redirected to the 'admin' page.
     * @param integer $id the ID of the model to be deleted
     */
    public function actionDelete($id) {
        if (Yii::app()->request->isPostRequest) {
            // we only allow deletion via POST request
            $this->loadModelLeave($id)->delete();

            // if AJAX request (triggered by deletion via admin grid view), we should not redirect the browser
            if (!isset($_GET['ajax']))
                $this->redirect(isset($_POST['returnUrl']) ? $_POST['returnUrl'] : array('admin'));
        }
        else
            throw new CHttpException(400, 'Invalid request. Please do not repeat this request again.');
    }

    public function actionOnRecent() {
        $model = new gPerson('search');
        $model->unsetAttributes();

        $criteria = new CDbCriteria;
        $criteria1 = new CDbCriteria;

        if (isset($_GET['gPerson'])) {
            $model->attributes = $_GET['gPerson'];

            $criteria1->compare('employee_name', $_GET['gPerson']['employee_name'], true, 'OR');
            //$criteria1->compare('t_domalamat',$_GET['gPerson']['t_domalamat'],true,'OR');
        }

        $criteria->mergeWith($criteria1);

        $this->render('onRecent', array(
            'model' => $model,
        ));
    }

    public function actionOnLeave() {
        $model = new gPerson('search');
        $model->unsetAttributes();

        $criteria = new CDbCriteria;
        $criteria1 = new CDbCriteria;

        if (isset($_GET['gPerson'])) {
            $model->attributes = $_GET['gPerson'];

            $criteria1->compare('employee_name', $_GET['gPerson']['employee_name'], true, 'OR');
            //$criteria1->compare('t_domalamat',$_GET['gPerson']['t_domalamat'],true,'OR');
        }

        $criteria->mergeWith($criteria1);

        $this->render('onLeave', array(
            'model' => $model,
        ));
    }

    public function actionOnPending() {
        $model = new gPerson('search');
        $model->unsetAttributes();

        $criteria = new CDbCriteria;
        $criteria1 = new CDbCriteria;

        if (isset($_GET['gPerson'])) {
            $model->attributes = $_GET['gPerson'];

            $criteria1->compare('employee_name', $_GET['gPerson']['employee_name'], true, 'OR');
            //$criteria1->compare('t_domalamat',$_GET['gPerson']['t_domalamat'],true,'OR');
        }

        $criteria->mergeWith($criteria1);

        $this->render('onPending', array(
            'model' => $model,
        ));
    }

    public function actionOnApproved() {
        $model = new gPerson('search');
        $model->unsetAttributes();

        $criteria = new CDbCriteria;
        $criteria1 = new CDbCriteria;

        if (isset($_GET['gPerson'])) {
            $model->attributes = $_GET['gPerson'];

            $criteria1->compare('employee_name', $_GET['gPerson']['employee_name'], true, 'OR');
            //$criteria1->compare('t_domalamat',$_GET['gPerson']['t_domalamat'],true,'OR');
        }

        $criteria->mergeWith($criteria1);

        $this->render('onApproved', array(
            'model' => $model,
        ));
    }

    public function actionIndex() {
        $model = new gPerson('search');

        $this->render('index', array(
            'model' => $model,
        ));
    }

    /**
     * Lists all models.
     */
    public function actionList() {
        $model = new gPerson('search');
        $model->unsetAttributes();

        $criteria = new CDbCriteria;
        $criteria1 = new CDbCriteria;

        if (isset($_GET['gPerson'])) {
            $model->attributes = $_GET['gPerson'];

            $criteria1->compare('employee_name', $_GET['gPerson']['employee_name'], true, 'OR');
            //$criteria1->compare('t_domalamat',$_GET['gPerson']['t_domalamat'],true,'OR');
        }

        $criteria->mergeWith($criteria1);

        if (Yii::app()->user->name != "admin") {
            $criteria2 = new CDbCriteria;
            $criteria2->condition = '(select c.company_id from g_person_career c WHERE t.id=c.parent_id AND c.status_id IN (' . implode(',', Yii::app()->getModule("m1")->PARAM_COMPANY_ARRAY) . ') ORDER BY c.start_date DESC LIMIT 1) IN (' . implode(",", sUser::model()->myGroupArray) . ')';
            $criteria->mergeWith($criteria2);

            $criteria3 = new CDbCriteria;  //8=RESIGN, 9=TERMINATION, 10=End Of Contract
            $criteria3->condition = '(select status_id from g_person_status s where s.parent_id = t.id ORDER BY start_date DESC LIMIT 1) NOT IN (' . implode(',', Yii::app()->getModule('m1')->PARAM_RESIGN_ARRAY) . ')';
            $criteria->mergeWith($criteria3);
        }


        $dataProvider = new CActiveDataProvider('gPerson', array(
            'criteria' => $criteria,
                )
        );

        $this->render('list', array(
            'dataProvider' => $dataProvider,
            'model' => $model,
        ));
    }

    public function actionApproved($id, $pid) {
        $model = $this->loadModelLeave($id);

        $modelBalance = gPerson::model()->with('leaveBalance')->findByPk($pid);
        //$criteria=new CDbCriteria;
        //$criteria->compare('parent_id',$pid);
        //$criteria->addNotInCondition('approved_id',array(1,7,8));
        //$criteria->order='end_date DESC';
        //$modelBalance=gLeave::model()->find($criteria);
        $newmasal = $modelBalance->leaveBalance->mass_leave;

        if ($model->approved_id == 1) {
            $newpribadi = $modelBalance->leaveBalance->person_leave - $model->number_of_day;
            $newbalance = $modelBalance->leaveBalance->balance - $model->number_of_day;
            $approved_value = 2;
        } elseif ($model->approved_id == 5) {
            $newpribadi = $modelBalance->leaveBalance->person_leave + $model->number_of_day;
            $newbalance = $modelBalance->leaveBalance->balance + $model->number_of_day;
            $approved_value = 7;
        } elseif ($model->approved_id == 6) {
            $newpribadi = $modelBalance->leaveBalance->person_leave + $model->number_of_day;
            $newbalance = $modelBalance->leaveBalance->balance + $model->number_of_day;
            $approved_value = 8;
        } else { //other, no changes
            $newpribadi = $modelBalance->leaveBalance->person_leave;
            $newbalance = $modelBalance->leaveBalance->balance;
        }
        gLeave::model()->updateByPk((int) $id, array(
            'mass_leave' => $newmasal,
            'person_leave' => $newpribadi,
            'balance' => $newbalance,
            'approved_id' => $approved_value,
            'updated_date' => time(),
            'updated_by' => Yii::app()->user->id
        ));

        Notification::newInbox(
                $modelBalance->userid, "Leave Approved. Your Leave has been approved by HR Admin", "Dear " . $modelBalance->employee_name . ",<br/> 
			Your leave request on " . $model->start_date . " has been approved by HR Admin. <br/> 
			Thank You.. <br/><br/>
			APHRIS"
        );
    }

    public function actionUnblock($id, $pid) {

        gLeave::model()->updateByPk((int) $id, array(
            'approved_id' => 1,
        ));
    }

    /**
     * Returns the data model based on the primary key given in the GET variable.
     * If the data model is not found, an HTTP exception will be raised.
     * @param integer the ID of the model to be loaded
     */
    public function loadModel($id) {
        $criteria = new CDbCriteria;

        if (Yii::app()->user->name != "admin") {
            $criteria->condition = '(select c.company_id from g_person_career c WHERE t.id=c.parent_id AND c.status_id IN (' .
                    implode(',', Yii::app()->getModule("m1")->PARAM_COMPANY_ARRAY) .
                    ') ORDER BY c.start_date DESC LIMIT 1) IN (' .
                    implode(",", sUser::model()->myGroupArray) . ') OR ' .
                    '(select c2.company_id from g_person_career2 c2 WHERE t.id=c2.parent_id AND c2.company_id IN (' .
                    implode(",", sUser::model()->myGroupArray) . ') ORDER BY c2.start_date DESC LIMIT 1) IN (' .
                    implode(",", sUser::model()->myGroupArray) . ')';
        }

        $model = gPerson::model()->findByPk((int) $id, $criteria);
        if ($model === null)
            throw new CHttpException(404, 'The requested page does not exist.');
        return $model;
    }

    /**
     * Returns the data model based on the primary key given in the GET variable.
     * If the data model is not found, an HTTP exception will be raised.
     * @param integer the ID of the model to be loaded
     */
    public function loadModelLeave($id) {
        $criteria = new CDbCriteria;

        //$criteria->with=array('person','company');
        //$criteria->addInCondition('company.company_id',sUser::model()->myGroupArray);

        $model = gLeave::model()->findByPk((int) $id, $criteria);
        if ($model === null)
            throw new CHttpException(404, 'The requested page does not exist.');
        return $model;
    }

    /**
     * Performs the AJAX validation.
     * @param CModel the model to be validated
     */
    protected function performAjaxValidation($model) {
        if (isset($_POST['ajax']) && $_POST['ajax'] === 'g-cuti-form') {
            echo CActiveForm::validate($model);
            Yii::app()->end();
        }
    }

    public function actionPrintLeave($id) {
        $pdf = new leaveForm('P', 'mm', 'A4');
        $pdf->AliasNbPages();
        $pdf->AddPage();
        $pdf->SetFont('Arial', '', 12);

        $criteria = new CDbCriteria;
        $criteria->compare('id', $id);
        //$criteria->compare('parent_id',gPerson::model()->find('userid ='.Yii::app()->user->id)->id);
        $criteria->compare('approved_id', 1);

        $model = gLeave::model()->find($criteria);
        if ($model === null)
            throw new CHttpException(404, 'The requested page does not exist.');

        $pdf->report($model);

        $pdf->Output();
    }

    public function actionPrintCancellationLeave($id) {
        $pdf = new leaveCancellationForm('P', 'mm', 'A4');
        $pdf->AliasNbPages();
        $pdf->AddPage();
        $pdf->SetFont('Arial', '', 12);

        $criteria = new CDbCriteria;
        $criteria->compare('id', $id);
        //$criteria->compare('parent_id',gPerson::model()->find('userid ='.Yii::app()->user->id)->id);
        $criteria->compare('approved_id', 6);

        $model = gLeave::model()->find($criteria);
        if ($model === null)
            throw new CHttpException(404, 'The requested page does not exist.');

        $pdf->report($model);

        $pdf->Output();
    }

    public function actionReportByDept() {
        $model = new fBeginEndDate;

        if (isset($_POST['fBeginEndDate'])) {
            $model->attributes = $_POST['fBeginEndDate'];
            if ($model->validate()) {

                if ($model->report_id == 1) {  //Detail
                    $pdf = new leaveSummaryByDept('L', 'mm', 'A4');
                    $pdf->AliasNbPages();
                    $pdf->AddPage();
                    $pdf->SetFont('Arial', '', 12);

                    $connection = Yii::app()->db;
                    $sql = "SELECT a.employee_name, a.department, a.level, a.join_date, a.job_title,
						(SELECT l.mass_leave from g_leave l WHERE l.parent_id = a.id AND approved_id NOT IN (1) ORDER BY l.start_date DESC LIMIT 1) as mass_leave,
						(SELECT l.person_leave from g_leave l WHERE l.parent_id = a.id AND approved_id NOT IN (1) ORDER BY l.start_date DESC LIMIT 1) as person_leave,
						(SELECT l.balance from g_leave l WHERE l.parent_id = a.id AND approved_id NOT IN (1) ORDER BY l.start_date DESC LIMIT 1) as balance,
						(SELECT l.start_date from g_leave l WHERE l.parent_id = a.id AND approved_id NOT IN (1) ORDER BY l.start_date DESC LIMIT 1) as last_leave
						FROM g_bi_person a
						WHERE company_id = " . sUser::model()->myGroup . " AND employee_status NOT IN ('Resign','End of Contract','Black List','Termination')
						ORDER by a.department, a.employee_name";

                    $command = $connection->createCommand($sql);
                    $rows = $command->queryAll();

                    //if(!isset($rows)
                    //	throw new CHttpException(404,'Record not found.');

                    $pdf->report($rows);
                } //elseif {

                $pdf->Output();
            }
        }

        $this->render('reportByDept', array('model' => $model));
    }

    ///TEMPORARY ACTION
    public function actionLeave2012($id) {
        $model = gPerson::model()->findByPk($id);
        $_md = "2012-" . date("m", strtotime($model->companyfirst->start_date)) . "-" . date("d", strtotime($model->companyfirst->start_date));
        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, year_leave , number_of_day, start_date , end_date  , leave_reason  , mass_leave, person_leave, balance, remark, approved_id) VALUES 
		(" . $id . "  ,'" . $_md . "' ,12,12,'" . $_md . "'  ,'" . $_md . "' ,'Auto Generated Leave',0,0,0,'Auto Generated Leave',9)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

    public function actionLebaran2012($id) {
        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, start_date, end_date, number_of_day, leave_reason, mass_leave, person_leave, balance, approved_id) VALUES 
		(" . $id . ",'2012-08-29','2012-08-21','2012-08-24',4,'Cuti Masal Lebaran 2012',0,0,0,2)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

    public function actionNatal2012($id) {
        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, start_date, end_date, number_of_day, leave_reason, mass_leave, person_leave, balance, approved_id) VALUES 
		(" . $id . ",'2012-12-24','2012-12-24','2012-12-31',5,'Cuti Masal Natal 2012',0,0,0,2)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

    //2013 Process
    public function actionLeave2013($id) {
        $model = gPerson::model()->findByPk($id);
        $_md = "2013-" . date("m", strtotime($model->companyfirst->start_date)) . "-" . date("d", strtotime($model->companyfirst->start_date));
        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, year_leave , start_date , end_date  , leave_reason  , mass_leave, person_leave, balance, remark, approved_id) VALUES 
		(" . $id . "  ,'" . $_md . "' ,12          ,'" . $_md . "'  ,'" . $_md . "' ,'Auto Generated Leave',0,0,0,'Auto Generated Leave',9)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

    public function actionNatal2013($id) {
        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, start_date, end_date, number_of_day, leave_reason, mass_leave, person_leave, balance, approved_id) VALUES 
		(" . $id . ",'2013-12-26','2013-12-26','2013-12-31',4,'Cuti Masal Natal 2013',0,0,0,2)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

    public function actionLebaran2013($id) {
        $connection = Yii::app()->db;
        $sql = "insert into g_leave 
		(parent_id, input_date, start_date, end_date, number_of_day, leave_reason, mass_leave, person_leave, balance, approved_id) VALUES 
		(" . $id . ",'2013-08-05','2013-08-05','2013-08-07',3,'Cuti Masal Lebaran 2013',0,0,0,2)";
        $command = $connection->createCommand($sql)->execute();

        $this->redirect(array('/m1/gLeave/view', 'id' => $id));
    }

}
