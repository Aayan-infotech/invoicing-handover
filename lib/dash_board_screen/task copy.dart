import 'package:flutter/material.dart';
import 'package:invoice_app/network/provider/project_provider.dart';
import 'package:invoice_app/utills/branded_text_filed.dart';
import 'package:provider/provider.dart';
import 'package:invoice_app/network/models/task_details_model.dart';

class TaskScreen extends StatefulWidget {
  final String taskId;
  const TaskScreen({super.key, required this.taskId});

  @override
  State<TaskScreen> createState() => _TaskScreenState();
}

class _TaskScreenState extends State<TaskScreen> {
  int? _selectedOption = 0;
  bool _scaleOption = false;
  bool _filledOption = true;
  List<bool> _exampleCheckboxes = List.generate(10, (index) => false);
  TextEditingController _controller1 = TextEditingController();
  TextEditingController _controller2 = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Fetch task details when screen initializes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      asyncInit();
    });
  }

  asyncInit() async {
    await Provider.of<ProjectProvider>(context, listen: false)
        .fetchTaskDetails(widget.taskId);
  }

  @override
  Widget build(BuildContext context) {
    final projectProvider = Provider.of<ProjectProvider>(context);
    final taskDetails = projectProvider.taskDetails;

    return Consumer<ProjectProvider>(
      builder: (context, projectProvider, _) {
        final taskDetails = projectProvider.taskDetails;

        return Scaffold(
          appBar: AppBar(
            title: projectProvider.isLoading
                ? Text("")
                : Text(taskDetails?.taskName ?? 'Task Details'),
            centerTitle: true,
            forceMaterialTransparency: true,
          ),
          body: projectProvider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : taskDetails == null
                  ? const Center(child: Text('Task details not available'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildSectionHeader(taskDetails.taskName),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _buildKeyValueRow(
                                  'Qty:', '${taskDetails.taskQuantity}'),
                              _buildKeyValueRow('Unit:', 'm2'),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            taskDetails.description,
                            style: const TextStyle(color: Colors.grey),
                          ),
                          const SizedBox(height: 16),
                          _buildKeyValueRow(
                              'Day rate /', '${taskDetails.amount} \$',
                              isBold: true),
                          const SizedBox(height: 20),
                          Center(child: _buildSectionHeader('Update task')),
                          const SizedBox(height: 16),
                          _buildInfoTable('Description', '',
                              'Korem ipsum dolor sit amet', _controller2),
                          const Divider(height: 40),
                          _buildSectionHeader('Task Status'),
                          const SizedBox(height: 20),
                          _buildOptionsTabButtons(),
                          const Divider(height: 40),
                          _buildSectionHeader('Upload File'),
                          Center(child: _buildUploadButton()),
                          const SizedBox(height: 24),
                          _buildSubmitButton(),
                        ],
                      ),
                    ),
        );
      },
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
    );
  }

  Widget _buildKeyValueRow(String key, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text('$key ',
              style: const TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.blue)),
          Text(value,
              style: TextStyle(
                  fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
                  color: Colors.blue)),
        ],
      ),
    );
  }

// In _buildNumberedCheckboxes method
  Widget _buildNumberedCheckboxes() {
    return SizedBox(
      width: MediaQuery.of(context).size.width,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: List.generate(10, (index) {
          bool isChecked = _exampleCheckboxes[index];
          return GestureDetector(
            onTap: () {
              setState(() {
                _exampleCheckboxes[index] = !isChecked;
              });
            },
            child: Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isChecked ? Colors.blue : Colors.grey.shade300,
                border: Border.all(color: Colors.black26),
              ),
              alignment: Alignment.center,
              child: Text(
                '${index + 1}',
                style: TextStyle(
                  color: isChecked ? Colors.white : Colors.black,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

// In _buildInfoTable method
  Widget _buildInfoTable(String header, String value, String subHeader,
      TextEditingController controller) {
    return Container(
      width: double.infinity,
      child: Column(
        children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(
              header,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            Text(
              value,
              style: TextStyle(color: Colors.blue),
            ),
          ]),
          SizedBox(
            height: 10,
          ),
          BrandedTextField(
              height: 40,
              controller: controller,
              labelText: "Enter description here"),
        ],
      ),
    );
  }

// In _buildOptionsRadio method
// 0 for 'Option', 1 for 'Selected'

  Widget _buildOptionsTabButtons() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final buttonWidth = constraints.maxWidth / 2.1;
        return ToggleButtons(
          isSelected: [_selectedOption == 0, _selectedOption == 1],
          onPressed: (index) {
            setState(() {
              _selectedOption = index;
            });
          },
          borderRadius: BorderRadius.circular(10),
          selectedColor: Colors.white,
          color: Colors.black,
          fillColor: Theme.of(context).primaryColor,
          constraints: BoxConstraints(
            minWidth: buttonWidth,
            minHeight: 48, // adjust height as needed
          ),
          children: const [
            Text('inProgress'),
            Text('Completed'),
          ],
        );
      },
    );
  }

  // Widget _buildNumberedCheckboxes() {
  //   return Wrap(
  //     spacing: 8,
  //     children: List.generate(10, (index) {
  //       return SizedBox(
  //         width: 40,
  //         child: CheckboxListTile(
  //           title: Text('${index + 1}'),
  //           value: _exampleCheckboxes[index],
  //           onChanged: (value) => setState(() => _exampleCheckboxes[index] = value!),
  //           controlAffinity: ListTileControlAffinity.leading,
  //           contentPadding: EdgeInsets.zero,
  //           dense: true,
  //         ),
  //       );
  //     }),
  //   );
  // }

  Widget _buildScaleOptions() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        Row(
          children: [
            Checkbox(
              value: _scaleOption,
              onChanged: (value) => setState(() => _scaleOption = value!),
              shape: const CircleBorder(),
            ),
            const Text('Scale Option'),
          ],
        ),
        const SizedBox(width: 20),
        Row(
          children: [
            Checkbox(
              value: _filledOption,
              onChanged: (value) => setState(() => _filledOption = value!),
              shape: const CircleBorder(),
            ),
            const Text('Filled'),
          ],
        ),
      ],
    );
  }

  Widget _buildUploadButton() {
    return ElevatedButton.icon(
      onPressed: () {},
      icon: const Icon(Icons.attach_file),
      label: const Text('Attach File'),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.grey[200],
        foregroundColor: Colors.black,
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () {},
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: const Text('Submit'),
      ),
    );
  }
}
